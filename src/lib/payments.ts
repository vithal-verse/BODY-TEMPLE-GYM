import { createClient } from "@/lib/supabase/server";
import type { Payment, PaymentInsert } from "@/types/database";

export type PaymentWithMember = Payment & { member_name: string };

/** All payments, newest first, with member name joined in JS. */
export async function getPayments(): Promise<PaymentWithMember[]> {
  const supabase = await createClient();

  const [{ data: payments, error: pErr }, { data: members, error: mErr }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .order("paid_at", { ascending: false }),
      supabase.from("members").select("id, name"),
    ]);

  if (pErr) console.error("getPayments error:", pErr.message);
  if (mErr) console.error("getPayments members error:", mErr.message);

  const nameById = new Map((members ?? []).map((m) => [m.id, m.name]));

  return (payments ?? []).map((p) => ({
    ...p,
    member_name: nameById.get(p.member_id) ?? "Unknown",
  }));
}

/** Payments for a single member, newest first. */
export async function getMemberPayments(memberId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("paid_at", { ascending: false });

  if (error) console.error("getMemberPayments error:", error.message);
  return data ?? [];
}

/** Payment summary stats. */
export async function getPaymentStats() {
  const payments = await getPayments();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const thisMonth = payments
    .filter((p) => new Date(p.paid_at) >= monthStart)
    .reduce((s, p) => s + p.amount, 0);

  const byMethod = {
    cash: payments.filter((p) => p.method === "cash").reduce((s, p) => s + p.amount, 0),
    upi: payments.filter((p) => p.method === "upi").reduce((s, p) => s + p.amount, 0),
    card: payments.filter((p) => p.method === "card").reduce((s, p) => s + p.amount, 0),
  };

  return { totalCollected, thisMonth, byMethod };
}

/** Insert a payment and bump the member's fees_paid by the amount. */
export async function addPayment(payload: PaymentInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Bump fees_paid on the member row
  const { data: member } = await supabase
    .from("members")
    .select("fees_paid")
    .eq("id", payload.member_id)
    .single();

  if (member) {
    await supabase
      .from("members")
      .update({ fees_paid: (member.fees_paid || 0) + payload.amount })
      .eq("id", payload.member_id);
  }

  return data;
}

import { createClient } from "@/lib/supabase/server";
import { getMembers } from "@/lib/members";
import type { Payment, Member } from "@/types/database";

export async function getPaymentHistory(memberId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("getPaymentHistory error:", error.message);
    return [];
  }
  return data ?? [];
}

export interface OutstandingSummary {
  totalOutstanding: number;
  membersWithBalance: (Member & { outstanding: number })[];
}

export async function getOutstandingSummary(): Promise<OutstandingSummary> {
  const members = await getMembers();

  const membersWithBalance = members
    .map((m) => ({ ...m, outstanding: m.amount_due - m.fees_paid }))
    .filter((m) => m.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding);

  const totalOutstanding = membersWithBalance.reduce(
    (sum, m) => sum + m.outstanding,
    0
  );

  return { totalOutstanding, membersWithBalance };
}

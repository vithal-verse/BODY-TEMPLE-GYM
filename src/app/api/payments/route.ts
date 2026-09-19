import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      member_id,
      renewal_id,
      amount,
      method,
      note,
    }: {
      member_id: string;
      renewal_id?: string | null;
      amount: number;
      method: PaymentMethod;
      note?: string;
    } = body;

    if (!member_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "member_id and a positive amount are required." },
        { status: 400 }
      );
    }

    if (!["cash", "upi", "card"].includes(method)) {
      return NextResponse.json(
        { error: "method must be cash, upi, or card." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Insert the payment record
    const { data: payment, error: pErr } = await supabase
      .from("payments")
      .insert({
        member_id,
        renewal_id: renewal_id ?? null,
        amount,
        method,
        note: note?.trim() || null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // 2. Bump fees_paid on the member row
    const { data: member, error: mFetchErr } = await supabase
      .from("members")
      .select("fees_paid")
      .eq("id", member_id)
      .single();

    if (!mFetchErr && member) {
      const newFeesPaid = (member.fees_paid || 0) + amount;
      await supabase
        .from("members")
        .update({ fees_paid: newFeesPaid })
        .eq("id", member_id);
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

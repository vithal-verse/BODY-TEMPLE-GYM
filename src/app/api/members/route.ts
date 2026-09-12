import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, MemberInsert } from "@/types/database";

/**
 * REST endpoint for the members table — useful for external integrations,
 * the Google Apps Script pull route, or future mobile clients.
 *
 * GET  /api/members        → list all members (ordered by created_at desc)
 * POST /api/members        → insert a new member
 *
 * Both operations require the request to carry a valid x-webhook-secret
 * header matching SHEET_WEBHOOK_SECRET so this endpoint is not open to
 * anonymous callers. Swap this guard for Supabase JWT verification if you
 * want it accessible from a mobile app running under Supabase Auth.
 */

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthorized(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  return secret === process.env.SHEET_WEBHOOK_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status"); // "active" | "expired" | null

  const supabase = getAdminClient();
  let query = supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (status === "active" || status === "expired") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [], count: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.start_date) {
    return NextResponse.json(
      { error: "name and start_date are required" },
      { status: 400 }
    );
  }

  const payload: MemberInsert = {
    name: body.name,
    age: body.age ?? null,
    email: body.email ?? null,
    phone: body.phone ?? null,
    plan_id: body.plan_id ?? null,
    plan_name: body.plan_name ?? null,
    start_date: body.start_date,
    end_date: body.end_date ?? null,
    fees_paid: body.fees_paid ?? 0,
    notes: body.notes ?? null,
  };

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("members")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: data }, { status: 201 });
}

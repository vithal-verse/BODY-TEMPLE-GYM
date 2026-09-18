import { createClient } from "@/lib/supabase/server";
import type { Renewal } from "@/types/database";

export async function getRenewalHistory(memberId: string): Promise<Renewal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("renewals")
    .select("*")
    .eq("member_id", memberId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("getRenewalHistory error:", error.message);
    return [];
  }
  return data ?? [];
}

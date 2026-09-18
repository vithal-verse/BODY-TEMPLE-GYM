import { createClient } from "@/lib/supabase/server";
import type { Attendance } from "@/types/database";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getTodaysAttendance(): Promise<Attendance[]> {
  const supabase = await createClient();
  const { start, end } = todayRange();

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .gte("checked_in_at", start)
    .lt("checked_in_at", end)
    .order("checked_in_at", { ascending: false });

  if (error) {
    console.error("getTodaysAttendance error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getMemberAttendanceHistory(
  memberId: string,
  limit = 20
): Promise<Attendance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getMemberAttendanceHistory error:", error.message);
    return [];
  }
  return data ?? [];
}

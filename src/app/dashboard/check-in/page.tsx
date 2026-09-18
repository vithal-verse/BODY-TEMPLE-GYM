import { getMembers } from "@/lib/members";
import { getTodaysAttendance } from "@/lib/attendance";
import CheckInPanel from "@/components/check-in-panel";

export default async function CheckInPage() {
  const [members, todaysAttendance] = await Promise.all([
    getMembers(),
    getTodaysAttendance(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-paper">Check in</h2>
        <p className="font-body text-sm text-paper/40">
          Find a member and mark them present. {todaysAttendance.length}{" "}
          {todaysAttendance.length === 1 ? "check-in" : "check-ins"} so far
          today.
        </p>
      </div>

      <CheckInPanel members={members} todaysAttendance={todaysAttendance} />
    </div>
  );
}

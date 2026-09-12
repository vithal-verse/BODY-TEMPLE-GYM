import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/types/database";

export default function StatusPill({ status }: { status: MemberStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-wide",
        status === "active"
          ? "border-good text-good"
          : "border-alert text-alert"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-good" : "bg-alert"
        )}
      />
      {status}
    </span>
  );
}

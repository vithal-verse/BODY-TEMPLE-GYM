import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  sublabel,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
  sublabel?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-2 p-6",
        accent
          ? "border-mango bg-mango text-ink"
          : "border-ink-line bg-ink-raised text-paper"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-body text-xs font-semibold tracking-wide",
            accent ? "text-ink/70" : "text-paper/45"
          )}
        >
          {label}
        </span>
        <Icon
          className={cn("h-5 w-5", accent ? "text-ink/60" : "text-mango")}
          strokeWidth={2}
        />
      </div>
      <div>
        <p className="font-display text-4xl leading-none">{value}</p>
        {sublabel && (
          <p
            className={cn(
              "mt-2 font-body text-sm",
              accent ? "text-ink/60" : "text-paper/40"
            )}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function OutstandingBadge({
  feesDue,
  feesPaid,
  className,
}: {
  feesDue: number;
  feesPaid: number;
  className?: string;
}) {
  const outstanding = Math.max(0, feesDue - feesPaid);

  if (outstanding === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border border-good/30 bg-good/10 px-2.5 py-1 font-body text-xs font-semibold text-good",
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Paid in full
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-alert/30 bg-alert/10 px-2.5 py-1 font-body text-xs font-semibold text-alert",
        className
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {formatCurrency(outstanding)} outstanding
    </span>
  );
}

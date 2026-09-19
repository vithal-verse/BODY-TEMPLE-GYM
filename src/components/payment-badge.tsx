"use client";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";
import { Banknote, Smartphone, CreditCard } from "lucide-react";

const CONFIG: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType; classes: string }
> = {
  cash: {
    label: "Cash",
    icon: Banknote,
    classes: "bg-good/15 text-good border-good/30",
  },
  upi: {
    label: "UPI",
    icon: Smartphone,
    classes: "bg-mango/15 text-mango border-mango/30",
  },
  card: {
    label: "Card",
    icon: CreditCard,
    classes: "bg-[#7c6af7]/15 text-[#a89ef9] border-[#7c6af7]/30",
  },
};

export default function PaymentBadge({
  method,
  className,
}: {
  method: PaymentMethod;
  className?: string;
}) {
  const { label, icon: Icon, classes } = CONFIG[method];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-wide",
        classes,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

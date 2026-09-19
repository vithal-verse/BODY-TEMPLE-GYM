import { Suspense } from "react";
import { getPayments, getPaymentStats } from "@/lib/payments";
import { getMembers } from "@/lib/members";
import { formatCurrency } from "@/lib/utils";
import { Banknote, TrendingUp, CalendarDays, CreditCard } from "lucide-react";
import PaymentsClient from "./payments-client";

export const metadata = {
  title: "Payments — Body Temple Gym",
  description: "Complete payment transaction history, Cash / UPI / Card, partial payments and outstanding balances.",
};

export default async function PaymentsPage() {
  const [payments, stats, members] = await Promise.all([
    getPayments(),
    getPaymentStats(),
    getMembers(),
  ]);

  const totalOutstanding = members.reduce(
    (sum, m) => sum + Math.max(0, (m.fees_due || 0) - (m.fees_paid || 0)),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-paper">Payments</h1>
        <p className="mt-1 font-body text-sm text-paper/50">
          Full transaction ledger — Cash, UPI &amp; Card
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={TrendingUp}
          label="Total collected"
          value={formatCurrency(stats.totalCollected)}
          accent="mango"
        />
        <SummaryCard
          icon={CalendarDays}
          label="This month"
          value={formatCurrency(stats.thisMonth)}
          accent="good"
        />
        <SummaryCard
          icon={Banknote}
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          accent={totalOutstanding > 0 ? "alert" : "good"}
        />
        <SummaryCard
          icon={CreditCard}
          label="Transactions"
          value={payments.length.toString()}
          accent="mango"
        />
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <MethodBreakdown label="Cash" value={stats.byMethod.cash} color="good" />
        <MethodBreakdown label="UPI" value={stats.byMethod.upi} color="mango" />
        <MethodBreakdown label="Card" value={stats.byMethod.card} color="card" />
      </div>

      {/* Interactive table */}
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center font-body text-sm text-paper/40">
            Loading transactions…
          </div>
        }
      >
        <PaymentsClient payments={payments} members={members} />
      </Suspense>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: "mango" | "good" | "alert";
}) {
  const colors = {
    mango: "text-mango border-mango/20 bg-mango/5",
    good: "text-good border-good/20 bg-good/5",
    alert: "text-alert border-alert/20 bg-alert/5",
  };
  const iconColors = {
    mango: "text-mango bg-mango/10",
    good: "text-good bg-good/10",
    alert: "text-alert bg-alert/10",
  };

  return (
    <div className={`flex flex-col gap-3 border-2 p-5 ${colors[accent]}`}>
      <div className={`flex h-9 w-9 items-center justify-center ${iconColors[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
          {label}
        </p>
        <p className="mt-0.5 font-display text-2xl text-paper">{value}</p>
      </div>
    </div>
  );
}

function MethodBreakdown({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "good" | "mango" | "card";
}) {
  const styles = {
    good: { bar: "bg-good", text: "text-good" },
    mango: { bar: "bg-mango", text: "text-mango" },
    card: { bar: "bg-[#7c6af7]", text: "text-[#a89ef9]" },
  };
  return (
    <div className="flex flex-col gap-2 border-2 border-ink-line bg-ink-raised p-4">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
          {label}
        </span>
        <span className={`font-display text-sm ${styles[color].text}`}>
          {formatCurrency(value)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-ink-line">
        <div
          className={`h-full ${styles[color].bar} transition-all`}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

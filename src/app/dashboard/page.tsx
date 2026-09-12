import Link from "next/link";
import { Users, UserCheck, UserX, Wallet, ArrowRight } from "lucide-react";
import { getDashboardStats } from "@/lib/members";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import StatCard from "@/components/stat-card";
import RevenueChart from "@/components/revenue-chart";

export default async function DashboardOverview() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total members"
          value={String(stats.totalMembers)}
          icon={Users}
          accent
        />
        <StatCard
          label="Active"
          value={String(stats.activeMembers)}
          icon={UserCheck}
          sublabel="Currently training"
        />
        <StatCard
          label="Expired"
          value={String(stats.expiredMembers)}
          icon={UserX}
          sublabel="Needs renewal"
        />
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Wallet}
          sublabel="Fees collected to date"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="border-2 border-ink-line bg-ink-raised p-6 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl text-paper">
              Revenue, last 6 months
            </h2>
          </div>
          <p className="mb-4 font-body text-sm text-paper/40">
            Fees collected, grouped by the month each membership started.
          </p>
          <RevenueChart data={stats.revenueByMonth} />
        </div>

        {/* Expiring soon */}
        <div className="flex flex-col border-2 border-ink-line bg-ink-raised p-6">
          <h2 className="font-display text-xl text-paper">Expiring soon</h2>
          <p className="mb-4 font-body text-sm text-paper/40">
            Active memberships ending within 7 days.
          </p>

          {stats.expiringSoon.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="font-body text-sm text-paper/40">
                Nothing expiring this week. Clear floor ahead.
              </p>
            </div>
          ) : (
            <ul className="flex flex-1 flex-col gap-3 overflow-y-auto">
              {stats.expiringSoon.slice(0, 6).map((m) => {
                const remaining = daysUntil(m.end_date);
                return (
                  <li key={m.id}>
                    <Link
                      href={`/dashboard/members/${m.id}`}
                      className="flex items-center justify-between border-2 border-ink-line px-4 py-3 transition-colors hover:border-mango"
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-paper">
                          {m.name}
                        </p>
                        <p className="font-body text-xs text-paper/40">
                          Ends {formatDate(m.end_date)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "font-display text-sm",
                          remaining !== null && remaining <= 2
                            ? "text-alert"
                            : "text-mango"
                        )}
                      >
                        {remaining === 0 ? "Today" : `${remaining}d`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/dashboard/members?filter=expiring"
            className="mt-4 flex items-center justify-center gap-2 border-2 border-ink-line py-2.5 font-body text-sm font-medium text-paper/70 transition-colors hover:border-mango hover:text-mango"
          >
            View all members
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

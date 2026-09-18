import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Mail, Phone, Calendar, Wallet, RotateCw, History, ClipboardCheck } from "lucide-react";
import { getMember } from "@/lib/members";
import { getRenewalHistory } from "@/lib/renewals";
import { getMemberAttendanceHistory } from "@/lib/attendance";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import StatusPill from "@/components/status-pill";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, history, attendance] = await Promise.all([
    getMember(id),
    getRenewalHistory(id),
    getMemberAttendanceHistory(id),
  ]);

  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/members"
        className="flex w-fit items-center gap-2 font-body text-sm text-paper/50 transition-colors hover:text-mango"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all members
      </Link>

      <div className="flex flex-col gap-6 border-2 border-ink-line bg-ink-raised p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-mango font-display text-2xl text-ink">
            {initials(member.name)}
          </span>
          <div>
            <h2 className="font-display text-3xl text-paper">
              {member.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusPill status={member.status} />
              {member.plan_name && (
                <span className="border-2 border-ink-line px-2.5 py-1 font-body text-xs font-medium text-paper/60">
                  {member.plan_name}
                </span>
              )}
              {member.age && (
                <span className="font-body text-sm text-paper/40">
                  {member.age} years old
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/dashboard/members/${member.id}/renew`}
            className="flex items-center justify-center gap-2 bg-mango px-5 py-2.5 font-display text-base tracking-wide text-ink transition-colors hover:bg-mango-deep"
          >
            <RotateCw className="h-4 w-4" />
            Renew
          </Link>
          <Link
            href={`/dashboard/members/${member.id}/edit`}
            className="flex items-center justify-center gap-2 border-2 border-mango px-5 py-2.5 font-display text-base tracking-wide text-mango transition-colors hover:bg-mango hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
            Edit details
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile icon={Mail} label="Email" value={member.email || "Not on file"} />
        <InfoTile icon={Phone} label="Phone" value={member.phone || "Not on file"} />
        <InfoTile
          icon={Calendar}
          label="Membership window"
          value={`${formatDate(member.start_date)} → ${formatDate(member.end_date)}`}
        />
        <InfoTile
          icon={Wallet}
          label="Fees paid"
          value={formatCurrency(member.fees_paid)}
        />
      </div>

      {member.notes && (
        <div className="border-2 border-ink-line bg-ink-raised p-6">
          <h3 className="font-display text-lg text-paper">Notes</h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-paper/60">
            {member.notes}
          </p>
        </div>
      )}

      <div className="border-2 border-ink-line bg-ink-raised p-6">
        <div className="mb-4 flex items-center gap-2 text-paper">
          <History className="h-4 w-4 text-mango" />
          <h3 className="font-display text-lg">Renewal history</h3>
        </div>

        {history.length === 0 ? (
          <p className="font-body text-sm text-paper/40">
            No history on record yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="border-b border-ink-line">
                  <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                    Plan
                  </th>
                  <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                    Start
                  </th>
                  <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                    End
                  </th>
                  <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                    Paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b border-ink-line last:border-b-0">
                    <td className="px-2 py-3 font-body text-sm text-paper">
                      {r.plan_name || "—"}
                    </td>
                    <td className="px-2 py-3 font-body text-sm text-paper/70">
                      {formatDate(r.start_date)}
                    </td>
                    <td className="px-2 py-3 font-body text-sm text-paper/70">
                      {formatDate(r.end_date)}
                    </td>
                    <td className="px-2 py-3 font-body text-sm text-paper/70">
                      {formatCurrency(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {history.length > 1 && (
                <tfoot>
                  <tr className="border-t-2 border-ink-line">
                    <td colSpan={3} className="px-2 py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                      Total collected
                    </td>
                    <td className="px-2 py-3 font-display text-sm text-mango">
                      {formatCurrency(history.reduce((sum, r) => sum + r.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      <div className="border-2 border-ink-line bg-ink-raised p-6">
        <div className="mb-4 flex items-center gap-2 text-paper">
          <ClipboardCheck className="h-4 w-4 text-mango" />
          <h3 className="font-display text-lg">Recent check-ins</h3>
        </div>

        {attendance.length === 0 ? (
          <p className="font-body text-sm text-paper/40">
            No check-ins on record yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {attendance.map((a) => (
              <li
                key={a.id}
                className="border-2 border-ink-line px-3 py-2 font-body text-xs text-paper/70"
              >
                {new Date(a.checked_in_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}{" "}
                <span className="text-paper/40">
                  {new Date(a.checked_in_at).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-2 border-ink-line bg-ink-raised p-5">
      <div className="flex items-center gap-2 text-paper/40">
        <Icon className="h-4 w-4" />
        <span className="font-body text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-body text-sm font-medium text-paper">{value}</p>
    </div>
  );
}

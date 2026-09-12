import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Mail, Phone, Calendar, Wallet } from "lucide-react";
import { getMember } from "@/lib/members";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import StatusPill from "@/components/status-pill";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

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
        <Link
          href={`/dashboard/members/${member.id}/edit`}
          className="flex items-center justify-center gap-2 border-2 border-mango px-5 py-2.5 font-display text-base tracking-wide text-mango transition-colors hover:bg-mango hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
          Edit details
        </Link>
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

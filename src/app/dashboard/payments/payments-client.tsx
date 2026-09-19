"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import type { PaymentWithMember } from "@/lib/payments";
import type { Member, PaymentMethod } from "@/types/database";
import { formatCurrency, cn } from "@/lib/utils";
import PaymentBadge from "@/components/payment-badge";
import OutstandingBadge from "@/components/outstanding-badge";

type SortKey = "paid_at" | "amount" | "member_name";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 15;

const METHOD_FILTERS: { key: PaymentMethod | "all"; label: string }[] = [
  { key: "all", label: "All methods" },
  { key: "cash", label: "Cash" },
  { key: "upi", label: "UPI" },
  { key: "card", label: "Card" },
];

export default function PaymentsClient({
  payments,
  members,
}: {
  payments: PaymentWithMember[];
  members: Member[];
}) {
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("paid_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // build a quick outstanding map
  const outstandingByMember = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m) => {
      const o = Math.max(0, (m.fees_due || 0) - (m.fees_paid || 0));
      if (o > 0) map.set(m.id, o);
    });
    return map;
  }, [members]);

  const filtered = useMemo(() => {
    let result = payments;

    if (methodFilter !== "all") {
      result = result.filter((p) => p.method === methodFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.member_name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "paid_at") {
        cmp = new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime();
      } else if (sortKey === "amount") {
        cmp = a.amount - b.amount;
      } else if (sortKey === "member_name") {
        cmp = a.member_name.localeCompare(b.member_name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [payments, methodFilter, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  // Members with outstanding balance
  const outstandingMembers = members.filter(
    (m) => (m.fees_due || 0) > (m.fees_paid || 0)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Outstanding members banner */}
      {outstandingMembers.length > 0 && (
        <div className="border-2 border-alert/30 bg-alert/5 p-4">
          <p className="mb-3 font-display text-sm text-alert">
            {outstandingMembers.length} member
            {outstandingMembers.length > 1 ? "s have" : " has"} outstanding
            balance
          </p>
          <div className="flex flex-wrap gap-2">
            {outstandingMembers.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/members/${m.id}`}
                className="flex items-center gap-2 border border-alert/20 bg-ink px-3 py-1.5 font-body text-xs text-paper transition-colors hover:border-alert hover:text-alert"
              >
                <span>{m.name}</span>
                <OutstandingBadge feesDue={m.fees_due} feesPaid={m.fees_paid} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/30" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by member name…"
            className="w-full border-2 border-ink-line bg-ink-raised py-2.5 pl-10 pr-3 font-body text-sm text-paper placeholder:text-paper/30 outline-none focus:border-mango"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-paper/30" />
          {METHOD_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setMethodFilter(f.key);
                setPage(1);
              }}
              className={cn(
                "border-2 px-3 py-2 font-body text-xs font-semibold uppercase tracking-wide transition-colors",
                methodFilter === f.key
                  ? "border-mango bg-mango text-ink"
                  : "border-ink-line text-paper/50 hover:border-paper/30 hover:text-paper"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-line py-16 text-center">
          <p className="font-display text-lg text-paper/60">
            No transactions found
          </p>
          <p className="font-body text-sm text-paper/35">
            Try a different filter or record the first payment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-ink-line">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b-2 border-ink-line bg-ink-raised">
                <SortTh
                  label="Member"
                  onClick={() => toggleSort("member_name")}
                  active={sortKey === "member_name"}
                  dir={sortDir}
                />
                <SortTh
                  label="Amount"
                  onClick={() => toggleSort("amount")}
                  active={sortKey === "amount"}
                  dir={sortDir}
                />
                <th className="px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Method
                </th>
                <SortTh
                  label="Date"
                  onClick={() => toggleSort("paid_at")}
                  active={sortKey === "paid_at"}
                  dir={sortDir}
                />
                <th className="px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const outstanding = outstandingByMember.get(p.member_id) ?? 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-ink-line last:border-b-0 hover:bg-ink-raised"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/members/${p.member_id}`}
                        className="font-body text-sm font-medium text-paper hover:text-mango"
                      >
                        {p.member_name}
                      </Link>
                      {outstanding > 0 && (
                        <p className="mt-0.5">
                          <OutstandingBadge
                            feesDue={outstanding}
                            feesPaid={0}
                          />
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-display text-sm text-mango">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge method={p.method} />
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-paper/60">
                      {new Date(p.paid_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      <span className="text-xs text-paper/35">
                        {new Date(p.paid_at).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-paper/50">
                      {p.note || <span className="text-paper/20">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-paper/40">
            Page {page} of {totalPages} ({filtered.length} transactions)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 border-2 border-ink-line px-3 py-2 font-body text-xs font-medium text-paper/60 transition-colors hover:border-mango hover:text-mango disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 border-2 border-ink-line px-3 py-2 font-body text-xs font-medium text-paper/60 transition-colors hover:border-mango hover:text-mango disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortTh({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
}) {
  return (
    <th className="px-4 py-3 text-left">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide transition-colors",
          active ? "text-mango" : "text-paper/50 hover:text-paper"
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-transform",
            active && dir === "desc" && "rotate-180"
          )}
        />
      </button>
    </th>
  );
}

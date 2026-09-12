"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import type { Member } from "@/types/database";
import { formatDate } from "@/lib/utils";

const COLUMNS: { key: keyof Member; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "plan_name", label: "Plan" },
  { key: "start_date", label: "Start date" },
  { key: "end_date", label: "End date" },
  { key: "fees_paid", label: "Fees paid" },
  { key: "status", label: "Status" },
];

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportPanel({ members }: { members: Member[] }) {
  function handleExport() {
    const header = COLUMNS.map((c) => c.label).join(",");
    const rows = members.map((m) =>
      COLUMNS.map((c) => toCsvValue(m[c.key])).join(",")
    );
    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `body-temple-gym-members-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-5 border-2 border-ink-line bg-ink-raised p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-mango text-mango">
            <FileSpreadsheet className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg text-paper">
              {members.length} {members.length === 1 ? "member" : "members"}{" "}
              ready to export
            </p>
            <p className="font-body text-sm text-paper/40">
              Includes contact info, plan, dates, fees, and status.
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={members.length === 0}
          className="flex w-full items-center justify-center gap-2 bg-mango px-6 py-3 font-display text-lg tracking-wide text-ink transition-colors hover:bg-mango-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download className="h-5 w-5" />
          Download CSV
        </button>
      </div>

      {/* Preview */}
      {members.length > 0 && (
        <div className="overflow-x-auto border-2 border-ink-line">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b-2 border-ink-line bg-ink-raised">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 5).map((m) => (
                <tr key={m.id} className="border-b border-ink-line last:border-b-0">
                  <td className="px-4 py-3 font-body text-sm text-paper">{m.name}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.age ?? "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.email || "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.phone || "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.plan_name || "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{formatDate(m.start_date)}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{formatDate(m.end_date)}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.fees_paid}</td>
                  <td className="px-4 py-3 font-body text-sm text-paper/60">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length > 5 && (
            <p className="border-t border-ink-line bg-ink-raised px-4 py-2 font-body text-xs text-paper/35">
              Showing 5 of {members.length} rows. The full list is included
              in the download.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

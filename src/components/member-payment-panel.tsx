"use client";

import { useState } from "react";
import { Receipt, Plus } from "lucide-react";
import type { Payment } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import PaymentBadge from "@/components/payment-badge";
import RecordPaymentForm from "@/components/record-payment-form";

export default function MemberPaymentPanel({
  memberId,
  renewalId,
  feesDue,
  feesPaid,
  payments,
}: {
  memberId: string;
  renewalId: string | null;
  feesDue: number;
  feesPaid: number;
  payments: Payment[];
}) {
  const [showForm, setShowForm] = useState(false);
  const outstanding = Math.max(0, feesDue - feesPaid);

  return (
    <div className="border-2 border-ink-line bg-ink-raised p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-paper">
          <Receipt className="h-4 w-4 text-mango" />
          <h3 className="font-display text-lg">Payments</h3>
          {payments.length > 0 && (
            <span className="ml-1 border border-ink-line px-2 py-0.5 font-body text-xs text-paper/40">
              {payments.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 border-2 border-mango px-4 py-2 font-display text-sm tracking-wide text-mango transition-colors hover:bg-mango hover:text-ink"
        >
          <Plus className="h-4 w-4" />
          Record payment
        </button>
      </div>

      {/* Inline record payment form */}
      {showForm && (
        <div className="mb-6 border-2 border-mango/30 bg-ink p-5">
          <RecordPaymentForm
            memberId={memberId}
            renewalId={renewalId}
            outstanding={outstanding}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Summary bar */}
      {feesDue > 0 && (
        <div className="mb-5 flex flex-col gap-2">
          <div className="flex items-center justify-between font-body text-xs text-paper/50">
            <span>Collected</span>
            <span>Total due</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden bg-ink-line">
            <div
              className="absolute inset-y-0 left-0 bg-mango transition-all"
              style={{
                width: feesDue > 0 ? `${Math.min(100, (feesPaid / feesDue) * 100)}%` : "0%",
              }}
            />
          </div>
          <div className="flex items-center justify-between font-body text-sm">
            <span className="font-medium text-mango">{formatCurrency(feesPaid)}</span>
            <span className="text-paper/50">{formatCurrency(feesDue)}</span>
          </div>
          {outstanding > 0 && (
            <p className="font-body text-xs text-alert">
              {formatCurrency(outstanding)} still outstanding
            </p>
          )}
        </div>
      )}

      {/* Payment list */}
      {payments.length === 0 ? (
        <p className="font-body text-sm text-paper/40">
          No payment transactions on record yet. Use the button above to record the first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="border-b border-ink-line">
                <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Amount
                </th>
                <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Method
                </th>
                <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Date
                </th>
                <th className="px-2 py-2 text-left font-body text-xs font-semibold uppercase tracking-wide text-paper/50">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-line last:border-b-0"
                >
                  <td className="px-2 py-3 font-display text-sm text-mango">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-2 py-3">
                    <PaymentBadge method={p.method} />
                  </td>
                  <td className="px-2 py-3 font-body text-sm text-paper/60">
                    {new Date(p.paid_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-2 py-3 font-body text-sm text-paper/50">
                    {p.note || <span className="text-paper/20">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            {payments.length > 1 && (
              <tfoot>
                <tr className="border-t-2 border-ink-line">
                  <td className="px-2 py-3 font-display text-sm text-mango">
                    {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
                  </td>
                  <td
                    colSpan={3}
                    className="px-2 py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper/50"
                  >
                    Total collected
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

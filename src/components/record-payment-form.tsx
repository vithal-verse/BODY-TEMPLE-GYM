"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, DollarSign, X } from "lucide-react";
import type { PaymentMethod } from "@/types/database";
import PaymentBadge from "@/components/payment-badge";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];

const inputClass =
  "w-full border-2 border-ink-line bg-ink px-4 py-2.5 font-body text-sm text-paper placeholder:text-paper/30 outline-none transition-colors focus:border-mango";

export default function RecordPaymentForm({
  memberId,
  renewalId,
  outstanding,
  onClose,
}: {
  memberId: string;
  renewalId?: string | null;
  outstanding: number;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(outstanding > 0 ? outstanding.toString() : "");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than ₹0.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        renewal_id: renewalId ?? null,
        amount: amt,
        method,
        note: note.trim() || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.refresh();
      onClose?.();
    }, 800);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center bg-good/15 text-good">
          <DollarSign className="h-6 w-6" />
        </div>
        <p className="font-display text-lg text-paper">Payment recorded!</p>
        <p className="font-body text-sm text-paper/50">Refreshing…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-paper">Record Payment</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-paper/40 transition-colors hover:text-paper"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Method selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-paper/75">
          Payment method
        </label>
        <div className="flex gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={`flex-1 border-2 px-3 py-2 font-body text-xs font-semibold uppercase tracking-wide transition-colors ${
                method === m.value
                  ? "border-mango bg-mango/10 text-mango"
                  : "border-ink-line text-paper/50 hover:border-paper/30 hover:text-paper"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-paper/75">
          Amount (₹){" "}
          {outstanding > 0 && (
            <span className="text-paper/40">
              — ₹{outstanding.toFixed(2)} outstanding
            </span>
          )}
        </label>
        <input
          type="number"
          min={1}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
          className={inputClass}
        />
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-paper/75">
          Note{" "}
          <span className="font-normal text-paper/40">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            method === "upi"
              ? "UPI reference ID…"
              : method === "card"
              ? "Last 4 digits / receipt no."
              : "Any note…"
          }
          className={inputClass}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="border-l-4 border-alert bg-alert/10 px-4 py-3 font-body text-sm text-alert"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 bg-mango px-5 py-3 font-display text-base tracking-wide text-ink transition-colors hover:bg-mango-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4" />
          )}
          {loading ? "Saving…" : "Record payment"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 font-body text-sm font-medium text-paper/50 transition-colors hover:text-paper"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-ink-line pt-3">
        <span className="font-body text-xs text-paper/40">Selected method:</span>
        <PaymentBadge method={method} />
      </div>
    </form>
  );
}

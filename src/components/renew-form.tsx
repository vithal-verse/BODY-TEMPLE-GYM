"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addMonths, addDays, format, isAfter, parseISO } from "date-fns";
import { Loader2, RotateCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { playChime } from "@/lib/sounds";
import { formatDate } from "@/lib/utils";
import type { Member, MembershipPlan } from "@/types/database";

function computeDefaultStartDate(member: Member): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (member.end_date) {
    const currentEnd = parseISO(member.end_date);
    // Still active (or expires today) — start the new term the day after
    // it ends, so paid time never overlaps or gaps by mistake.
    if (member.status === "active" && !isAfter(today, currentEnd)) {
      return format(addDays(currentEnd, 1), "yyyy-MM-dd");
    }
  }
  // Already expired, or no prior end date on record — start today.
  return format(today, "yyyy-MM-dd");
}

export default function RenewForm({
  member,
  plans,
}: {
  member: Member;
  plans: MembershipPlan[];
}) {
  const router = useRouter();
  const defaultPlanId =
    plans.find((p) => p.id === member.plan_id)?.id.toString() ??
    plans[0]?.id.toString() ??
    "";
  const defaultStart = computeDefaultStartDate(member);
  const defaultPlan = plans.find((p) => p.id.toString() === defaultPlanId);

  const [planId, setPlanId] = useState(defaultPlanId);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(
    defaultPlan
      ? format(addMonths(parseISO(defaultStart), defaultPlan.duration_months), "yyyy-MM-dd")
      : ""
  );
  const [amount, setAmount] = useState(
    defaultPlan?.fee_amount.toString() ?? ""
  );
  const [feesDue, setFeesDue] = useState(
    defaultPlan?.fee_amount.toString() ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePlanChange(newPlanId: string) {
    setPlanId(newPlanId);
    const plan = plans.find((p) => p.id.toString() === newPlanId);
    if (plan) {
      setEndDate(format(addMonths(parseISO(startDate), plan.duration_months), "yyyy-MM-dd"));
      setAmount(plan.fee_amount.toString());
      setFeesDue(plan.fee_amount.toString());
    }
  }

  function handleStartDateChange(newStart: string) {
    setStartDate(newStart);
    const plan = plans.find((p) => p.id.toString() === planId);
    if (plan && newStart) {
      setEndDate(format(addMonths(parseISO(newStart), plan.duration_months), "yyyy-MM-dd"));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const plan = plans.find((p) => p.id.toString() === planId);

    const term = {
      plan_id: planId ? parseInt(planId, 10) : null,
      plan_name: plan?.name ?? null,
      amount: amount ? parseFloat(amount) : 0,
      start_date: startDate,
      end_date: endDate || null,
    };

    // Log the new term in history first...
    const { error: renewalError } = await supabase.from("renewals").insert({
      member_id: member.id,
      ...term,
    });

    if (renewalError) {
      setLoading(false);
      setError(renewalError.message);
      return;
    }

    // ...then make it the member's current term.
    const { error: memberError } = await supabase
      .from("members")
      .update({
        plan_id: term.plan_id,
        plan_name: term.plan_name,
        fees_paid: term.amount,
        fees_due: feesDue ? parseFloat(feesDue) : term.amount,
        start_date: term.start_date,
        end_date: term.end_date,
      })
      .eq("id", member.id);

    setLoading(false);

    if (memberError) {
      setError(memberError.message);
      return;
    }

    playChime();
    router.push(`/dashboard/members/${member.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 border-2 border-ink-line bg-ink px-4 py-3">
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-paper/40">
            Current plan
          </p>
          <p className="font-body text-sm text-paper">
            {member.plan_name || "No plan on record"}
          </p>
        </div>
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-paper/40">
            Current end date
          </p>
          <p className="font-body text-sm text-paper">
            {formatDate(member.end_date)}
          </p>
        </div>
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-paper/40">
            Status
          </p>
          <p className="font-body text-sm capitalize text-paper">
            {member.status}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="New plan">
            <select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className={inputClass}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.fee_amount} / {p.duration_months}mo
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fees paid (₹)" hint="Amount actually collected today">
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Total fees due (₹)" hint="Full plan price for this term">
            <input
              type="number"
              min={0}
              step="0.01"
              value={feesDue}
              onChange={(e) => setFeesDue(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="New start date">
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="New end date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </Field>
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
            className="flex items-center gap-2 bg-mango px-6 py-3 font-display text-lg tracking-wide text-ink transition-colors hover:bg-mango-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RotateCw className="h-5 w-5" />
            )}
            Confirm renewal
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 font-body text-sm font-medium text-paper/50 transition-colors hover:text-paper"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full border-2 border-ink-line bg-ink px-4 py-2.5 font-body text-sm text-paper placeholder:text-paper/30 outline-none transition-colors focus:border-mango";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-paper/75">
        {label}
        {hint && <span className="ml-1.5 font-normal text-paper/35 text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

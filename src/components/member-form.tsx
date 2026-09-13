"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Member, MembershipPlan } from "@/types/database";
import { addMonths, format } from "date-fns";

export default function MemberForm({
  plans,
  existingMember,
}: {
  plans: MembershipPlan[];
  existingMember?: Member;
}) {
  const router = useRouter();
  const isEdit = Boolean(existingMember);

  const [name, setName] = useState(existingMember?.name ?? "");
  const [age, setAge] = useState(existingMember?.age?.toString() ?? "");
  const [email, setEmail] = useState(existingMember?.email ?? "");
  const [phone, setPhone] = useState(existingMember?.phone ?? "");
  const [planId, setPlanId] = useState<string>(
    existingMember?.plan_id?.toString() ?? (plans[0]?.id.toString() ?? "")
  );
  const [startDate, setStartDate] = useState(
    existingMember?.start_date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(existingMember?.end_date ?? "");
  const [feesPaid, setFeesPaid] = useState(
    existingMember?.fees_paid?.toString() ?? ""
  );
  const [notes, setNotes] = useState(existingMember?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePlanChange(newPlanId: string) {
    setPlanId(newPlanId);
    const plan = plans.find((p) => p.id.toString() === newPlanId);
    if (plan && startDate) {
      setEndDate(
        format(addMonths(new Date(startDate), plan.duration_months), "yyyy-MM-dd")
      );
      if (!feesPaid) setFeesPaid(plan.fee_amount.toString());
    }
  }

  function handleStartDateChange(newStart: string) {
    setStartDate(newStart);
    const plan = plans.find((p) => p.id.toString() === planId);
    if (plan && newStart) {
      setEndDate(format(addMonths(new Date(newStart), plan.duration_months), "yyyy-MM-dd"));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const plan = plans.find((p) => p.id.toString() === planId);

    const payload = {
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      plan_id: planId ? parseInt(planId, 10) : null,
      plan_name: plan?.name ?? null,
      start_date: startDate,
      end_date: endDate || null,
      fees_paid: feesPaid ? parseFloat(feesPaid) : 0,
      notes: notes.trim() || null,
    };

    const { error: dbError } = isEdit
      ? await supabase
          .from("members")
          .update(payload)
          .eq("id", existingMember!.id)
      : await supabase.from("members").insert(payload);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/dashboard/members");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Paras Bhonsle"
            className={inputClass}
          />
        </Field>
        <Field label="Age">
          <input
            type="number"
            min={10}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="28"
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="paras@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </Field>
        <Field label="Membership plan">
          <select
            value={planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className={inputClass}
          >
            <option value="">No plan selected</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.fee_amount} / {p.duration_months}mo
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fees paid (₹)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={feesPaid}
            onChange={(e) => setFeesPaid(e.target.value)}
            placeholder="1500"
            className={inputClass}
          />
        </Field>
        <Field label="Start date">
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Injury history, goals, preferences…"
          className={inputClass}
        />
      </Field>

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
            <Save className="h-5 w-5" />
          )}
          {isEdit ? "Save changes" : "Add member"}
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
  );
}

const inputClass =
  "w-full border-2 border-ink-line bg-ink px-4 py-2.5 font-body text-sm text-paper placeholder:text-paper/30 outline-none transition-colors focus:border-mango";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-paper/75">
        {label}
        {required && <span className="text-mango"> *</span>}
      </label>
      {children}
    </div>
  );
}

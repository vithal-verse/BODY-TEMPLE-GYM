"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Loader2 } from "lucide-react";
import type { Member, Attendance } from "@/types/database";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { playTick } from "@/lib/sounds";
import StatusPill from "@/components/status-pill";

export default function CheckInPanel({
  members,
  todaysAttendance,
}: {
  members: Member[];
  todaysAttendance: Attendance[];
}) {
  const [query, setQuery] = useState("");
  const [checkedInIds, setCheckedInIds] = useState<Map<string, string>>(
    () => new Map(todaysAttendance.map((a) => [a.member_id, a.checked_in_at]))
  );
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on load — this page exists to be used without reaching for
  // the mouse, dozens of times a day.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, members]);

  async function handleCheckIn(member: Member) {
    setCheckingInId(member.id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attendance")
      .insert({ member_id: member.id })
      .select("checked_in_at")
      .single();

    setCheckingInId(null);

    if (error) {
      alert(`Couldn't check in ${member.name}: ${error.message}`);
      return;
    }

    playTick();
    setCheckedInIds((prev) => new Map(prev).set(member.id, data.checked_in_at));
    // Clear and refocus so the next name can be typed immediately.
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-paper/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name, email, or phone…"
          className="w-full border-2 border-ink-line bg-ink-raised py-4 pl-12 pr-4 font-body text-lg text-paper placeholder:text-paper/30 outline-none focus:border-mango"
        />
      </div>

      {query.trim() === "" ? (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-line py-16 text-center">
          <p className="font-body text-sm text-paper/35">
            Start typing to find someone.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-line py-16 text-center">
          <p className="font-display text-lg text-paper/60">No match</p>
          <p className="font-body text-sm text-paper/35">
            Check the spelling, or add them as a new member first.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {results.map((member) => {
              const checkedInAt = checkedInIds.get(member.id);
              return (
                <motion.li
                  key={member.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-4 border-2 border-ink-line bg-ink-raised px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-body text-base font-medium text-paper">
                        {member.name}
                      </p>
                      <StatusPill status={member.status} />
                    </div>
                    <p className="truncate font-body text-xs text-paper/40">
                      {member.plan_name || "No plan on record"}
                    </p>
                  </div>

                  {checkedInAt ? (
                    <span className="flex shrink-0 items-center gap-2 border-2 border-good px-4 py-2.5 font-body text-sm font-medium text-good">
                      <Check className="h-4 w-4" />
                      {new Date(checkedInAt).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(member)}
                      disabled={checkingInId === member.id}
                      className={cn(
                        "flex shrink-0 items-center gap-2 bg-mango px-5 py-2.5 font-display text-base tracking-wide text-ink transition-colors hover:bg-mango-deep disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {checkingInId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Check in"
                      )}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

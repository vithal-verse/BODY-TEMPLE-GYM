"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

export default function TopBar({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="hidden items-center justify-between border-b-2 border-ink-line bg-ink px-10 py-5 lg:flex">
      <div>
        <h1 className="font-display text-2xl text-paper">
          Welcome, {displayName}
        </h1>
        <p className="font-body text-sm text-paper/45">
          Here&apos;s what&apos;s happening on the floor today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-2 border-ink-line px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center bg-mango font-display text-sm text-ink">
            {initials(displayName)}
          </span>
          <div className="leading-tight">
            <p className="font-body text-sm font-medium text-paper">
              {displayName}
            </p>
            <p className="font-body text-xs text-paper/40">{email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border-2 border-ink-line px-4 py-2.5 font-body text-sm font-medium text-paper/70 transition-colors hover:border-alert hover:text-alert"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}

"use client";

import { useEffect } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center border-2 border-alert text-alert">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <div>
        <h2 className="font-display text-2xl text-paper">Something broke.</h2>
        <p className="mt-2 max-w-sm font-body text-sm text-paper/50">
          An unexpected error occurred loading this section. You can try again
          or refresh the page.
        </p>
        {error.digest && (
          <p className="mt-3 font-body text-xs text-paper/25">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={retry}
        className="flex items-center gap-2 border-2 border-alert px-5 py-2.5 font-display text-base tracking-wide text-alert transition-colors hover:bg-alert hover:text-ink"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}

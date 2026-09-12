import Link from "next/link";
import { Dumbbell, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      {/* Accent strip */}
      <div className="hazard-edge fixed inset-x-0 top-0 h-2" />

      <div className="flex flex-col items-center gap-6">
        {/* Icon */}
        <span className="flex h-20 w-20 items-center justify-center border-2 border-mango text-mango">
          <Dumbbell className="h-8 w-8" />
        </span>

        {/* Headline */}
        <div>
          <p className="font-display text-[8rem] leading-none text-mango/20 select-none">
            404
          </p>
          <h1 className="font-display text-4xl text-paper -mt-6 sm:text-5xl">
            Nothing here.
          </h1>
          <p className="mt-3 max-w-xs font-body text-base text-paper/50">
            That page doesn&apos;t exist or was moved. Check the URL and try
            again.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="mt-2 flex items-center gap-2 border-2 border-mango px-6 py-3 font-display text-lg tracking-wide text-mango transition-colors hover:bg-mango hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

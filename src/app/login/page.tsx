import LoginForm from "./login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: identity panel */}
      <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-ink px-8 py-10 lg:px-16 lg:py-14">
        {/* Corner hazard strip — subtle, one accent, not full-bleed */}
        <div className="hazard-edge absolute inset-x-0 top-0 h-2" />

        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="font-body text-sm font-semibold tracking-wide text-paper/70">
            Body Temple Gym
          </span>
        </div>

        <div className="flex flex-col items-start gap-8 py-16 lg:py-0">
          <Image
            src="/brand/logo.png"
            alt="Body Temple Gym"
            width={220}
            height={220}
            priority
            className="h-40 w-40 lg:h-56 lg:w-56"
          />
          <div>
            <h1 className="font-display text-5xl leading-[0.95] text-mango sm:text-6xl lg:text-7xl">
              Run the
              <br />
              floor.
            </h1>
            <p className="mt-4 max-w-sm font-body text-base text-paper/60">
              Sign in to manage members, track dues, and keep the gym
              running — from the front desk or the office.
            </p>
          </div>
        </div>

        <p className="font-body text-xs text-paper/30">
          Admin access only. Contact the gym owner if you need an account.
        </p>
      </section>

      {/* Right: form panel */}
      <section className="flex flex-1 items-center justify-center bg-ink-raised px-8 py-14 lg:px-16">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl text-paper">Admin login</h2>
          <p className="mt-2 font-body text-sm text-paper/50">
            Enter your credentials to open the dashboard.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

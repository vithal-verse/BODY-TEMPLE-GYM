"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, UserPlus, Download, X, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/members", label: "Members", icon: Users },
  { href: "/dashboard/members/new", label: "Add member", icon: UserPlus },
  { href: "/dashboard/export", label: "Export data", icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const NavList = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors border-l-4",
            isActive(href)
              ? "border-mango bg-mango/10 text-mango"
              : "border-transparent text-paper/60 hover:border-ink-line hover:bg-ink-raised hover:text-paper"
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top strip */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b-2 border-ink-line bg-ink px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-lg text-mango">BODY TEMPLE</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="text-paper"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-ink lg:hidden">
          <div className="pt-4">{NavList}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-ink-line bg-ink lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 border-b-2 border-ink-line px-6 py-6"
        >
          <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
          <div className="leading-tight">
            <p className="font-display text-lg tracking-wide text-mango">BODY TEMPLE</p>
            <p className="font-body text-[11px] font-medium tracking-widest text-paper/40">
              GYM ADMIN
            </p>
          </div>
        </Link>
        <div className="flex-1 py-4">{NavList}</div>
        <div className="hazard-edge h-1.5" />
      </aside>

      {/* Spacer for mobile fixed header */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

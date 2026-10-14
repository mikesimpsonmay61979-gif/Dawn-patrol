"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { usePro } from "@/lib/pro";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pro, ready } = usePro();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-timber-950 text-mist-100 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-timber-950/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="block">
          <p className="text-[10px] font-bold tracking-[0.22em] text-dawn-300 uppercase">Missouri</p>
          <p className="font-display text-[1.55rem] leading-none tracking-tight text-mist-100">Dawn Patrol</p>
        </Link>
        <Link
          href="/pro"
          className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${
            ready && pro ? "bg-dawn-400 text-timber-950" : "border border-white/15 text-mist-100"
          }`}
        >
          {ready && pro ? "Pro" : "Go Pro"}
        </Link>
      </header>
      <main className="px-4 pt-3 pb-28">{children}</main>
      <BottomNav />
      <ServiceWorkerRegister />
    </div>
  );
}

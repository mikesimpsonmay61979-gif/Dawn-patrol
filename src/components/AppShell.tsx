import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ConsentNotice } from "@/components/ConsentNotice";
import { HeaderLinks } from "@/components/HeaderLinks";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-timber-950 text-mist-100 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/8 bg-timber-950/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="block min-w-0">
          <p className="text-[10px] font-bold tracking-[0.22em] text-dawn-300 uppercase">Missouri</p>
          <p className="font-display text-[1.55rem] leading-none tracking-tight text-mist-100">Dawn Patrol</p>
        </Link>
        <HeaderLinks />
      </header>
      <main className="px-4 pt-3 pb-28">
        <ConsentNotice />
        {children}
      </main>
      <BottomNav />
      <ServiceWorkerRegister />
    </div>
  );
}

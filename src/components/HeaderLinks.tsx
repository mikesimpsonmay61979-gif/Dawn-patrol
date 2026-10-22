"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export function HeaderLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="App" className="flex shrink-0 items-center gap-1.5">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold tracking-wide ${
              active ? "bg-dawn-400 text-timber-950" : "border border-white/15 text-mist-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

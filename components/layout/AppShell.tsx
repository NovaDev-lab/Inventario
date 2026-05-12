"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/inventario/", label: "Inventario" },
  { href: "/ventas/", label: "Ventas" },
  { href: "/reportes/", label: "Reportes" },
  { href: "/configuracion/", label: "Config" },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50 text-zinc-900 dark:from-zinc-950 dark:to-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-emerald-200 bg-white/90 backdrop-blur dark:border-emerald-900/30 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/inventario/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
              P
            </span>
            <span className="hidden sm:inline">Perfumes Harem</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => {
              const active = pathname.startsWith(l.href.replace(/\/$/, ""));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-4 py-3 text-base font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-900 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-emerald-200 py-8 text-center text-xs text-zinc-600 dark:border-emerald-900/30 dark:text-zinc-400">
        Datos guardados solo en este dispositivo (IndexedDB). Exporta respaldos desde Configuración.
      </footer>
    </div>
  );
}

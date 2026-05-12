import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  actions,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-zinc-950/80">
      {(title || subtitle || actions) && (
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>}
            {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

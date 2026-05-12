import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: Props) {
  return (
    <select
      className={`w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/40 dark:bg-zinc-900 dark:text-zinc-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/40 dark:bg-zinc-900 dark:text-zinc-50 ${className}`}
      {...props}
    />
  );
}

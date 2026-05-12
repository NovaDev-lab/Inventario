import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secondary:
    "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 focus-visible:ring-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-100 dark:hover:bg-emerald-800/60",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
  ghost:
    "bg-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
} as const;

type Variant = keyof typeof variants;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-white dark:ring-offset-zinc-950";
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

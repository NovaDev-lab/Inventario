import type { LabelHTMLAttributes, ReactNode } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode };

export function Label({ className = "", children, ...props }: Props) {
  return (
    <label
      className={`block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

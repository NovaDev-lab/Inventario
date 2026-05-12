"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <Button variant="ghost" className="px-2 py-1" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">{footer}</div>}
      </div>
    </div>
  );
}

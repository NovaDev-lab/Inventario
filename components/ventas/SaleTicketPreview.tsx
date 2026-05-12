"use client";

import type { AppSettings, Sale } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/domain/constants";

export function SaleTicketPreview({ sale, settings }: { sale: Sale | null; settings: AppSettings }) {
  if (!sale) return null;
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Última venta registrada</div>
      <div className="mt-2 grid gap-1 text-zinc-800 dark:text-zinc-100">
        <div className="flex justify-between gap-3">
          <span>Total</span>
          <span className="font-semibold">{formatCurrency(sale.total, settings)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Ganancia bruta</span>
          <span className="font-semibold">{formatCurrency(sale.grossProfit, settings)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Pago</span>
          <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { AppSettings, DashboardKpis } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";

export function KpiCards({ kpis, settings }: { kpis: DashboardKpis; settings: AppSettings }) {
  const items = [
    { label: "Ventas", value: String(kpis.saleCount), hint: "Transacciones en el periodo" },
    { label: "Ingreso neto", value: formatCurrency(kpis.revenueNet, settings), hint: "Antes de impuesto" },
    { label: "Impuestos", value: formatCurrency(kpis.taxAmount, settings), hint: "Cobrado en tickets" },
    { label: "Total cobrado", value: formatCurrency(kpis.total, settings), hint: "Incluye impuesto" },
    { label: "Costo estimado", value: formatCurrency(kpis.totalCost, settings), hint: "COGS" },
    { label: "Ganancia bruta", value: formatCurrency(kpis.grossProfit, settings), hint: "Sin impuesto en margen" },
    { label: "Margen promedio", value: `${kpis.avgMarginPct.toFixed(1)}%`, hint: "Sobre ingreso neto" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{it.label}</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{it.value}</div>
          <div className="mt-1 text-xs text-zinc-500">{it.hint}</div>
        </div>
      ))}
    </div>
  );
}

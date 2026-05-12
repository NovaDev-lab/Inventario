"use client";

import type { AppSettings, Sale } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/domain/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function SalesHistory({
  sales,
  settings,
  onTicket,
}: {
  sales: Sale[];
  settings: AppSettings;
  onTicket: (sale: Sale) => void;
}) {
  if (!sales.length) {
    return <p className="text-sm text-zinc-500">Aún no hay ventas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 pr-3">Fecha</th>
            <th className="py-2 pr-3">Total</th>
            <th className="py-2 pr-3">Ganancia</th>
            <th className="py-2 pr-3">Pago</th>
            <th className="py-2 pr-3">Cliente</th>
            <th className="py-2 pr-3 text-right">Ticket</th>
          </tr>
        </thead>
        <tbody>
          {sales.slice(0, 50).map((s) => (
            <tr key={s.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
              <td className="py-2 pr-3 whitespace-nowrap">
                {new Date(s.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="py-2 pr-3 font-medium">{formatCurrency(s.total, settings)}</td>
              <td className="py-2 pr-3">
                <span className="inline-flex items-center gap-2">
                  {formatCurrency(s.grossProfit, settings)}
                  {s.grossProfit < 0 && <Badge tone="danger">Negativo</Badge>}
                </span>
              </td>
              <td className="py-2 pr-3">{PAYMENT_METHOD_LABELS[s.paymentMethod]}</td>
              <td className="py-2 pr-3">{s.customerName || "—"}</td>
              <td className="py-2 pr-3 text-right">
                <Button type="button" variant="secondary" className="px-3 py-1 text-xs" onClick={() => onTicket(s)}>
                  PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

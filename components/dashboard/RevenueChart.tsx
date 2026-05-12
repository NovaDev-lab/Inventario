"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppSettings, SeriesPoint } from "@/lib/domain/types";

export function RevenueChart({
  data,
  settings,
}: {
  data: SeriesPoint[];
  settings: AppSettings;
}) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No hay datos suficientes para graficar en este periodo.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={44} />
          <Tooltip
            formatter={(value, name) => {
              const v = typeof value === "number" ? value : Number(value ?? 0);
              const label = name === "revenueNet" ? "Ingreso neto" : "Ganancia bruta";
              return [
                new Intl.NumberFormat("es-MX", { style: "currency", currency: settings.currency }).format(v),
                label,
              ];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenueNet" name="Ingreso neto" stroke="#4f46e5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="grossProfit" name="Ganancia bruta" stroke="#059669" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

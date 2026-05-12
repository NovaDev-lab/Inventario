"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDbReady } from "@/lib/hooks/useDbReady";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function HomePage() {
  const { ready, error } = useDbReady();
  const { range, setRange, kpis, series, settings, loading } = useDashboard(ready);

  const title = useMemo(() => {
    if (!settings) return "Panel";
    return settings.businessName;
  }, [settings]);

  if (error) {
    return (
      <Card title="Error">
        <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </Card>
    );
  }

  if (!ready || !settings) {
    return (
      <Card title="Cargando…">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Preparando base de datos local.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Resumen de los últimos días. Los datos viven solo en este navegador.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/inventario/"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Inventario
          </Link>
          <Link
            href="/ventas/"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Nueva venta
          </Link>
        </div>
      </div>

      <Card
        title="Rango de fechas"
        subtitle="Ajusta el periodo del panel principal"
        actions={
          <Button type="button" variant="secondary" disabled={loading} onClick={() => window.location.reload()}>
            Refrescar
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="from">Desde</Label>
            <Input id="from" type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="to">Hasta</Label>
            <Input id="to" type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card title="Indicadores" subtitle={loading ? "Actualizando…" : "Periodo seleccionado"}>
        <KpiCards kpis={kpis} settings={settings} />
      </Card>

      <Card title="Tendencia diaria" subtitle="Ingreso neto vs ganancia bruta">
        <RevenueChart data={series} settings={settings} />
      </Card>
    </div>
  );
}

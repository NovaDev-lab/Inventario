"use client";

import { useDbReady } from "@/lib/hooks/useDbReady";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default function ReportesPage() {
  const { ready, error } = useDbReady();
  const { range, setRange, kpis, series, settings, loading } = useDashboard(ready);

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
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Abriendo base de datos local.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">KPIs y gráficas por rango de fechas.</p>
      </div>

      <Card title="Periodo" subtitle={loading ? "Actualizando…" : undefined}>
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

      <Card title="Indicadores">
        <KpiCards kpis={kpis} settings={settings} />
      </Card>

      <Card title="Tendencia diaria">
        <RevenueChart data={series} settings={settings} />
      </Card>
    </div>
  );
}

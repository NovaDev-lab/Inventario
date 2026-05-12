"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppSettings, DashboardRange, Sale } from "@/lib/domain/types";
import { computeKpis, buildDailySeries, listSalesInRange } from "@/lib/services/reports.service";
import { loadSettings } from "@/lib/services/settings.service";
import { defaultDashboardRange } from "@/lib/domain/dates";

export function useDashboard(ready: boolean) {
  const [range, setRange] = useState<DashboardRange>(() => defaultDashboardRange(30));
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const [s, st] = await Promise.all([listSalesInRange(range), loadSettings()]);
      setSales(s);
      setSettings(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar reportes.");
    } finally {
      setLoading(false);
    }
  }, [ready, range]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const kpis = useMemo(() => computeKpis(sales), [sales]);
  const series = useMemo(() => buildDailySeries(sales), [sales]);

  return {
    range,
    setRange,
    sales,
    settings,
    kpis,
    series,
    loading,
    error,
    refresh,
  };
}

import type { DashboardKpis, DashboardRange, Sale, SeriesPoint } from "@/lib/domain/types";
import { roundMoney } from "@/lib/domain/money";
import { getAllSales } from "@/lib/db/indexeddb";

function parseDay(iso: string): string {
  return iso.slice(0, 10);
}

function inRange(iso: string, range: DashboardRange): boolean {
  const d = parseDay(iso);
  return d >= range.from && d <= range.to;
}

export async function listSalesInRange(range: DashboardRange): Promise<Sale[]> {
  const all = await getAllSales();
  return all.filter((s) => inRange(s.createdAt, range)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function computeKpis(sales: Sale[]): DashboardKpis {
  if (!sales.length) {
    return {
      saleCount: 0,
      revenueNet: 0,
      taxAmount: 0,
      total: 0,
      totalCost: 0,
      grossProfit: 0,
      avgMarginPct: 0,
    };
  }

  const revenueNet = roundMoney(sales.reduce((s, x) => s + x.revenueNet, 0));
  const taxAmount = roundMoney(sales.reduce((s, x) => s + x.taxAmount, 0));
  const total = roundMoney(sales.reduce((s, x) => s + x.total, 0));
  const totalCost = roundMoney(sales.reduce((s, x) => s + x.totalCost, 0));
  const grossProfit = roundMoney(sales.reduce((s, x) => s + x.grossProfit, 0));
  const avgMarginPct =
    revenueNet > 0 ? roundMoney((grossProfit / revenueNet) * 100) : 0;

  return {
    saleCount: sales.length,
    revenueNet,
    taxAmount,
    total,
    totalCost,
    grossProfit,
    avgMarginPct,
  };
}

export function buildDailySeries(sales: Sale[]): SeriesPoint[] {
  const map = new Map<string, SeriesPoint>();

  for (const s of sales) {
    const date = parseDay(s.createdAt);
    const cur = map.get(date) ?? {
      date,
      revenueNet: 0,
      grossProfit: 0,
      saleCount: 0,
    };
    cur.revenueNet = roundMoney(cur.revenueNet + s.revenueNet);
    cur.grossProfit = roundMoney(cur.grossProfit + s.grossProfit);
    cur.saleCount += 1;
    map.set(date, cur);
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

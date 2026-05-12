import type { DashboardRange } from "./types";

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultDashboardRange(days = 30): DashboardRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

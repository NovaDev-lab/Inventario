import type { AppSettings, BackupPayload, Product, Sale } from "@/lib/domain/types";
import { DEFAULT_SETTINGS } from "@/lib/domain/types";
import { getDb } from "@/lib/db/indexeddb";
import { loadSettings } from "@/lib/services/settings.service";

export async function exportBackup(): Promise<BackupPayload> {
  const db = await getDb();
  const products = await db.getAll("products");
  const sales = await db.getAll("sales");
  const settings = await loadSettings();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    products,
    sales,
    settings,
  };
}

export async function downloadBackupJson(): Promise<void> {
  const payload = await exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `respaldo-perfumeria-${payload.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function assertBackupPayload(raw: unknown): BackupPayload {
  if (!raw || typeof raw !== "object") throw new Error("JSON inválido.");
  const o = raw as Record<string, unknown>;
  if (o.version !== 1) throw new Error("Versión de respaldo no soportada.");
  if (!Array.isArray(o.products) || !Array.isArray(o.sales))
    throw new Error("Estructura de respaldo incompleta.");
  const settings = (o.settings ?? DEFAULT_SETTINGS) as AppSettings;
  return {
    version: 1,
    exportedAt: String(o.exportedAt ?? new Date().toISOString()),
    products: o.products as Product[],
    sales: o.sales as Sale[],
    settings,
  };
}

export async function importBackupJsonFile(
  file: File,
  mode: "replace" | "merge",
): Promise<{ products: number; sales: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  const payload = assertBackupPayload(parsed);

  const db = await getDb();
  const tx = db.transaction(["products", "sales", "kv"], "readwrite");
  const pStore = tx.objectStore("products");
  const sStore = tx.objectStore("sales");
  const kv = tx.objectStore("kv");

  if (mode === "replace") {
    await pStore.clear();
    await sStore.clear();
  }

  for (const p of payload.products) {
    await pStore.put(p);
  }
  for (const s of payload.sales) {
    await sStore.put(s);
  }
  await kv.put(payload.settings, "settings");
  await tx.done;

  return { products: payload.products.length, sales: payload.sales.length };
}

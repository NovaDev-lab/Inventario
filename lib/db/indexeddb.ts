import { openDB, type IDBPDatabase } from "idb";
import type { AppSettings, Product, Sale } from "@/lib/domain/types";

const DB_NAME = "perfumeria-inventario";
const DB_VERSION = 2;

export type PerfumeriaDB = IDBPDatabase;

let dbPromise: Promise<PerfumeriaDB> | null = null;

export function getDb(): Promise<PerfumeriaDB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("by-brand", "brand", { unique: false });
          store.createIndex("by-updatedAt", "updatedAt", { unique: false });
        } else {
          const store = transaction.objectStore("products");
          if (store.indexNames.contains("by-sku")) store.deleteIndex("by-sku");
          if (store.indexNames.contains("by-category")) store.deleteIndex("by-category");
          if (store.indexNames.contains("by-active")) store.deleteIndex("by-active");
          if (!store.indexNames.contains("by-brand")) {
            store.createIndex("by-brand", "brand", { unique: false });
          }
          if (!store.indexNames.contains("by-updatedAt")) {
            store.createIndex("by-updatedAt", "updatedAt", { unique: false });
          }
        }
        if (!db.objectStoreNames.contains("sales")) {
          const sales = db.createObjectStore("sales", { keyPath: "id" });
          sales.createIndex("by-createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv");
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.getAll("products");
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDb();
  return db.get("products", id);
}

export async function putProduct(product: Product): Promise<void> {
  const db = await getDb();
  await db.put("products", product);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("products", id);
}

export async function getAllSales(): Promise<Sale[]> {
  const db = await getDb();
  return db.getAll("sales");
}

export async function putSale(sale: Sale): Promise<void> {
  const db = await getDb();
  await db.put("sales", sale);
}

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<AppSettings | undefined> {
  const db = await getDb();
  return (await db.get("kv", SETTINGS_KEY)) as AppSettings | undefined;
}

export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  await db.put("kv", settings, SETTINGS_KEY);
}

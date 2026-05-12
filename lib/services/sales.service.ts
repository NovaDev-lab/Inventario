import type { Product, Sale, SaleLineItem } from "@/lib/domain/types";
import { getDb } from "@/lib/db/indexeddb";
import { loadSettings } from "@/lib/services/settings.service";
import {
  assertPaymentMethod,
  buildSaleLineItems,
  computeSaleTotals,
  type SaleDraftLine,
  ValidationError,
} from "@/lib/domain/validators";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface CreateSaleInput {
  lines: SaleDraftLine[];
  discountGlobal: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const settings = await loadSettings();
  const db = await getDb();
  const tx = db.transaction(["products", "sales"], "readwrite");
  const productStore = tx.objectStore("products");
  const saleStore = tx.objectStore("sales");

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products: Product[] = [];
  for (const id of productIds) {
    const p = await productStore.get(id);
    if (!p) throw new ValidationError("Uno de los productos ya no existe.");
    products.push(p);
  }

  const map = new Map(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
      },
    ]),
  );

  const items: SaleLineItem[] = buildSaleLineItems(input.lines, map);

  const totals = computeSaleTotals(items, input.discountGlobal, settings.taxRate);

  const sale: Sale = {
    id: newId(),
    createdAt: new Date().toISOString(),
    items,
    subtotal: totals.subtotal,
    discountGlobal: totals.discountGlobal,
    taxableBase: totals.taxableBase,
    taxRate: settings.taxRate,
    taxAmount: totals.taxAmount,
    total: totals.total,
    totalCost: totals.totalCost,
    revenueNet: totals.revenueNet,
    grossProfit: totals.grossProfit,
    paymentMethod: assertPaymentMethod(input.paymentMethod),
    customerName: String(input.customerName ?? "").trim(),
    customerPhone: String(input.customerPhone ?? "").trim(),
    notes: String(input.notes ?? "").trim(),
  };

  for (const line of sale.items) {
    const p = await productStore.get(line.productId);
    if (!p) throw new ValidationError("Producto no encontrado al descontar stock.");
    if (p.stock < line.qty) throw new ValidationError(`Stock insuficiente para "${p.name}".`);
    const updated: Product = {
      ...p,
      stock: p.stock - line.qty,
      updatedAt: sale.createdAt,
    };
    await productStore.put(updated);
  }

  await saleStore.put(sale);
  await tx.done;
  return sale;
}

import { roundMoney } from "./money";
import type {
  AppSettings,
  PaymentMethod,
  Product,
  ProductGender,
  SaleLineItem,
} from "./types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const GENDERS: ProductGender[] = ["unisex", "femenino", "masculino"];
const PAYMENTS: PaymentMethod[] = [
  "efectivo",
  "tarjeta",
  "transferencia",
  "otro",
];

function assertNonEmpty(value: string, field: string): string {
  const t = value.trim();
  if (!t) throw new ValidationError(`${field} es obligatorio.`);
  return t;
}

function assertNumber(
  value: unknown,
  field: string,
  opts?: { min?: number; integer?: boolean },
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new ValidationError(`${field} debe ser un número válido.`);
  if (opts?.min !== undefined && n < opts.min)
    throw new ValidationError(`${field} no puede ser menor que ${opts.min}.`);
  if (opts?.integer && !Number.isInteger(n))
    throw new ValidationError(`${field} debe ser un número entero.`);
  return n;
}

export function parseProductInput(raw: Partial<Product>): Omit<Product, "id" | "createdAt" | "updatedAt"> {
  const name = assertNonEmpty(String(raw.name ?? ""), "Nombre");
  const brand = String(raw.brand ?? "").trim();
  const genderRaw = String(raw.gender ?? "unisex");
  if (!GENDERS.includes(genderRaw as ProductGender))
    throw new ValidationError("Género objetivo no válido.");
  const gender = genderRaw as ProductGender;

  const presentationMl = assertNumber(raw.presentationMl, "Presentación (ml)", {
    min: 0,
  });
  const cost = roundMoney(assertNumber(raw.cost, "Costo", { min: 0 }));
  const price = roundMoney(assertNumber(raw.price, "Precio al publico", { min: 0 }));
  const stock = assertNumber(raw.stock, "Stock", { min: 0, integer: true });
  const minStock = assertNumber(raw.minStock, "Stock mínimo", { min: 0, integer: true });
  const imageDataUrl = raw.imageDataUrl ? String(raw.imageDataUrl) : null;
  const notes = String(raw.notes ?? "");

  return {
    name,
    brand,
    gender,
    presentationMl,
    cost,
    price,
    stock,
    minStock,
    imageDataUrl,
    notes,
  };
}

export function parseSettingsInput(raw: Partial<AppSettings>): AppSettings {
  const businessName = assertNonEmpty(String(raw.businessName ?? ""), "Nombre del negocio");
  const address = String(raw.address ?? "").trim();
  const phone = String(raw.phone ?? "").trim();
  const taxRate = assertNumber(raw.taxRate ?? 0, "Tasa de impuesto", { min: 0 });
  if (taxRate > 1) throw new ValidationError("La tasa de impuesto debe estar entre 0 y 1 (ej. 0.16).");
  const currency = assertNonEmpty(String(raw.currency ?? "MXN"), "Moneda");

  return {
    businessName,
    address,
    phone,
    taxRate: roundMoney(taxRate),
    currency: currency.toUpperCase().slice(0, 8),
  };
}

export interface SaleDraftLine {
  productId: string;
  qty: number;
  unitPrice?: number;
}

export function buildSaleLineItems(
  lines: SaleDraftLine[],
  productsById: Map<string, Pick<Product, "id" | "name" | "cost" | "price" | "stock">>,
): SaleLineItem[] {
  if (!lines.length) throw new ValidationError("Agrega al menos un producto a la venta.");

  const items: SaleLineItem[] = [];

  for (const line of lines) {
    if (!line.productId) throw new ValidationError("Selecciona un producto para cada línea.");
    const p = productsById.get(line.productId);
    if (!p) throw new ValidationError("Producto no encontrado.");
    const qty = assertNumber(line.qty, "Cantidad", { min: 1, integer: true });
    if (qty > p.stock) throw new ValidationError(`Stock insuficiente para "${p.name}".`);

    const unitPrice = roundMoney(assertNumber(p.price, "Precio unitario", { min: 0 }));
    const gross = roundMoney(qty * unitPrice);
    const lineSubtotal = gross;

    items.push({
      productId: p.id,
      productNameSnapshot: p.name,
      qty,
      unitPrice,
      unitCostSnapshot: roundMoney(p.cost),
      lineSubtotal,
    });
  }

  return items;
}

export function computeSaleTotals(
  items: SaleLineItem[],
  discountGlobal: number,
  taxRate: number,
): {
  subtotal: number;
  discountGlobal: number;
  taxableBase: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  revenueNet: number;
  grossProfit: number;
} {
  const subtotal = roundMoney(items.reduce((s, i) => s + i.lineSubtotal, 0));
  const dg = roundMoney(assertNumber(discountGlobal, "Descuento global", { min: 0 }));
  if (dg > subtotal) throw new ValidationError("El descuento global no puede superar el subtotal.");

  const revenueNet = roundMoney(subtotal - dg);
  const taxAmount = roundMoney(revenueNet * taxRate);
  const total = roundMoney(revenueNet + taxAmount);
  const totalCost = roundMoney(
    items.reduce((s, i) => s + roundMoney(i.qty * i.unitCostSnapshot), 0),
  );
  const grossProfit = roundMoney(revenueNet - totalCost);

  return {
    subtotal,
    discountGlobal: dg,
    taxableBase: revenueNet,
    taxAmount,
    total,
    totalCost,
    revenueNet,
    grossProfit,
  };
}

export function assertPaymentMethod(value: string): PaymentMethod {
  if (!PAYMENTS.includes(value as PaymentMethod))
    throw new ValidationError("Método de pago no válido.");
  return value as PaymentMethod;
}

/** Identificadores y entidades del dominio (perfumería, inventario local-first). */

export type ProductId = string;
export type SaleId = string;

export type ProductGender = "unisex" | "femenino" | "masculino";

export type PaymentMethod =
  | "efectivo"
  | "tarjeta"
  | "transferencia"
  | "otro";

export interface Product {
  id: ProductId;
  name: string;
  brand: string;
  gender: ProductGender;
  presentationMl: number;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  imageDataUrl: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleLineItem {
  productId: ProductId;
  productNameSnapshot: string;
  qty: number;
  unitPrice: number;
  unitCostSnapshot: number;
  lineSubtotal: number;
}

export interface Sale {
  id: SaleId;
  createdAt: string;
  items: SaleLineItem[];
  /** Suma de lineSubtotal antes de descuento global e impuestos */
  subtotal: number;
  discountGlobal: number;
  /** Base imponible: subtotal - discountGlobal */
  taxableBase: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  /** Ingreso neto antes de impuesto: subtotal - discountGlobal */
  revenueNet: number;
  /** Ganancia bruta aproximada: revenueNet - totalCost (impuesto no incluido en margen) */
  grossProfit: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  notes: string;
}

export interface AppSettings {
  businessName: string;
  address: string;
  phone: string;
  /** Tasa en fracción 0–1 (ej. 0.16 = 16%) */
  taxRate: number;
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: "Perfumes Harem",
  address: "",
  phone: "",
  taxRate: 0,
  currency: "MXN",
};

export interface DashboardRange {
  from: string;
  to: string;
}

export interface DashboardKpis {
  saleCount: number;
  revenueNet: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  avgMarginPct: number;
}

export interface SeriesPoint {
  date: string;
  revenueNet: number;
  grossProfit: number;
  saleCount: number;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  products: Product[];
  sales: Sale[];
  settings: AppSettings;
}

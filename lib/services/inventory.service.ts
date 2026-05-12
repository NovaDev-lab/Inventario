import type { Product } from "@/lib/domain/types";
import {
  deleteProduct,
  getAllProducts,
  getProductById,
  putProduct,
} from "@/lib/db/indexeddb";
import { parseProductInput, ValidationError } from "@/lib/domain/validators";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function upsertProduct(
  input: Partial<Product> & { id?: string },
): Promise<Product> {
  const now = new Date().toISOString();
  const parsed = parseProductInput(input);

  const id = input.id?.trim() || newId();
  const existing = input.id ? await getProductById(input.id) : undefined;

  const product: Product = {
    id,
    ...parsed,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await putProduct(product);
  return product;
}

export async function removeProduct(id: string): Promise<void> {
  await deleteProduct(id);
}

export async function adjustStock(id: string, delta: number): Promise<Product> {
  const p = await getProductById(id);
  if (!p) throw new ValidationError("Producto no encontrado.");
  const next = p.stock + delta;
  if (next < 0) throw new ValidationError("El stock no puede quedar negativo.");
  const updated: Product = {
    ...p,
    stock: next,
    updatedAt: new Date().toISOString(),
  };
  await putProduct(updated);
  return updated;
}

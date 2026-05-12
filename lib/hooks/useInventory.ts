"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/domain/types";
import { listProducts, removeProduct, upsertProduct } from "@/lib/services/inventory.service";
import { ValidationError } from "@/lib/domain/validators";

export function useInventory(ready: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await listProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar inventario.");
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (input: Partial<Product> & { id?: string }) => {
      try {
        const p = await upsertProduct(input);
        await refresh();
        return p;
      } catch (e) {
        if (e instanceof ValidationError) throw e;
        throw e;
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await removeProduct(id);
      await refresh();
    },
    [refresh],
  );

  return { products, loading, error, refresh, save, remove };
}

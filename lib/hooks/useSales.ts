"use client";

import { useCallback, useEffect, useState } from "react";
import type { Sale } from "@/lib/domain/types";
import { getAllSales } from "@/lib/db/indexeddb";
import { createSale, type CreateSaleInput } from "@/lib/services/sales.service";
import { ValidationError } from "@/lib/domain/validators";

export function useSales(ready: boolean) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const all = await getAllSales();
      setSales(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar ventas.");
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const registerSale = useCallback(
    async (input: CreateSaleInput): Promise<Sale> => {
      try {
        const sale = await createSale(input);
        await refresh();
        return sale;
      } catch (e) {
        if (e instanceof ValidationError) throw e;
        throw e;
      }
    },
    [refresh],
  );

  return { sales, loading, error, refresh, registerSale };
}

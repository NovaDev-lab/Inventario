"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { AppSettings, Product } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ProductTable({
  products,
  settings,
  onEdit,
  onDelete,
}: {
  products: Product[];
  settings: AppSettings;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        if (!q) return true;
        const hay = `${p.name} ${p.brand}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [products, query]);

  return (
    <div className="space-y-4">
      <div className="max-w-xl">
        <label className="mb-2 block text-sm font-semibold text-emerald-900 dark:text-emerald-200">Buscar producto</label>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o marca…" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center text-zinc-600 dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-zinc-300">
          No hay productos para mostrar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const low = p.stock <= p.minStock;
            return (
              <article
                key={p.id}
                className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/40 dark:bg-zinc-950"
              >
                <div className="mb-3 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-zinc-900">
                  {p.imageDataUrl ? (
                    <Image
                      src={p.imageDataUrl}
                      alt={p.name}
                      width={640}
                      height={640}
                      unoptimized
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-zinc-500">Sin imagen</div>
                  )}
                </div>

                <h3 className="line-clamp-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</h3>
                <p className="mb-2 text-sm text-zinc-500">{p.brand}</p>
                <p className="mb-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(p.price, settings)}
                </p>
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300">Stock: {p.stock}</span>
                  {low && <Badge tone="warning">Bajo</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) onDelete(p);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

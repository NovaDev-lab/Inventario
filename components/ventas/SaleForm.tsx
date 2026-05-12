"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppSettings, Product } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/domain/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  buildSaleLineItems,
  computeSaleTotals,
  ValidationError,
} from "@/lib/domain/validators";
import type { CreateSaleInput } from "@/lib/services/sales.service";

type Line = {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
};

function newLineId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function SaleForm({
  products,
  settings,
  onSubmit,
}: {
  products: Product[];
  settings: AppSettings;
  onSubmit: (input: CreateSaleInput) => Promise<void>;
}) {
  const selectable = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [products],
  );

  const [lines, setLines] = useState<Line[]>(() => [
    {
      id: newLineId(),
      productId: selectable[0]?.id ?? "",
      qty: 1,
      unitPrice: selectable[0]?.price ?? 0,
    },
  ]);
  const [discountGlobal, setDiscountGlobal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectable.length) return;
    setLines((prev) =>
      prev.map((line) => {
        const exists = selectable.some((p) => p.id === line.productId);
        const fallback = selectable[0];
        if (!exists) {
          return {
            ...line,
            productId: fallback.id,
            unitPrice: fallback.price,
          };
        }
        const product = selectable.find((p) => p.id === line.productId);
        if (!product) return line;
        return { ...line, unitPrice: product.price };
      }),
    );
  }, [selectable]);

  const preview = useMemo(() => {
    try {
      const map = new Map(
        selectable.map((p) => [
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
      const items = buildSaleLineItems(
        lines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
          unitPrice: l.unitPrice,
        })),
        map,
      );
      return computeSaleTotals(items, discountGlobal, settings.taxRate);
    } catch {
      return null;
    }
  }, [lines, discountGlobal, selectable, settings.taxRate]);

  function addLine() {
    const p = selectable[0];
    setLines((prev) => [
      ...prev,
      {
        id: newLineId(),
        productId: p?.id ?? "",
        qty: 1,
        unitPrice: p?.price ?? 0,
      },
    ]);
  }

  function updateLine(id: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (patch.productId) {
          const pr = selectable.find((x) => x.id === patch.productId);
          if (pr) next.unitPrice = pr.price;
        }
        return next;
      }),
    );
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        lines: lines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
          unitPrice: l.unitPrice,
        })),
        discountGlobal,
        paymentMethod,
        customerName,
        customerPhone,
        notes,
      });
      setDiscountGlobal(0);
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setLines([
        {
          id: newLineId(),
          productId: selectable[0]?.id ?? "",
          qty: 1,
          unitPrice: selectable[0]?.price ?? 0,
        },
      ]);
    } catch (err) {
      setError(err instanceof ValidationError ? err.message : err instanceof Error ? err.message : "No se pudo registrar la venta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Productos</h3>
          <Button type="button" variant="secondary" onClick={addLine} disabled={!selectable.length}>
            Añadir línea
          </Button>
        </div>

        {!selectable.length ? (
          <p className="text-sm text-zinc-500">No hay productos disponibles. Crea inventario primero.</p>
        ) : (
          <div className="space-y-3">
            {lines.map((line) => {
              const p = selectable.find((x) => x.id === line.productId);
              const low = p && p.stock <= p.minStock;
              return (
                <div key={line.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                    <div className="sm:col-span-5">
                      <Label>Producto</Label>
                      <Select
                        value={line.productId}
                        onChange={(e) => updateLine(line.id, { productId: e.target.value })}
                      >
                        {selectable.map((pr) => (
                          <option key={pr.id} value={pr.id} disabled={pr.stock <= 0}>
                            {pr.name} · Stock {pr.stock}
                          </option>
                        ))}
                      </Select>
                      {p && low && (
                        <div className="mt-2">
                          <Badge tone="warning">Stock bajo</Badge>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={line.qty}
                        onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Precio unit.</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        readOnly
                      />
                    </div>
                    <div className="sm:col-span-3 flex sm:justify-end">
                      <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => removeLine(line.id)}>
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Descuento global</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={discountGlobal}
            onChange={(e) => setDiscountGlobal(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Método de pago</Label>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Cliente (opcional)</Label>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre" />
        </div>
        <div>
          <Label>Teléfono cliente</Label>
          <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="WhatsApp / teléfono" />
        </div>
        <div className="sm:col-span-2">
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {preview && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-950 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-50">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-indigo-700/80 dark:text-indigo-200/80">Subtotal</div>
              <div className="text-base font-semibold">{formatCurrency(preview.subtotal, settings)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-indigo-700/80 dark:text-indigo-200/80">Impuesto</div>
              <div className="text-base font-semibold">{formatCurrency(preview.taxAmount, settings)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-indigo-700/80 dark:text-indigo-200/80">Total a cobrar</div>
              <div className="text-base font-semibold">{formatCurrency(preview.total, settings)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-indigo-700/80 dark:text-indigo-200/80">Ganancia bruta (sin impuesto)</div>
              <div className="text-base font-semibold">{formatCurrency(preview.grossProfit, settings)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !selectable.length}>
          {saving ? "Registrando…" : "Registrar venta"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Product, ProductGender } from "@/lib/domain/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const empty: Partial<Product> = {
  name: "",
  brand: "",
  gender: "unisex",
  presentationMl: 50,
  cost: 0,
  price: 0,
  stock: 0,
  minStock: 0,
  imageDataUrl: null,
  notes: "",
};

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Product | null;
  onSubmit: (values: Partial<Product> & { id?: string }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const base = useMemo(() => (initial ? { ...initial } : { ...empty }), [initial]);
  const [values, setValues] = useState<Partial<Product>>(base);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof Product) =>
    (v: string | number | boolean) => {
      setValues((prev) => ({ ...prev, [key]: v }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...values,
        id: initial?.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {error && (
        <div className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      )}

      <div className="sm:col-span-2">
        <Label htmlFor="name">Nombre comercial</Label>
        <Input id="name" value={String(values.name ?? "")} onChange={(e) => set("name")(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="brand">Marca</Label>
        <Input id="brand" value={String(values.brand ?? "")} onChange={(e) => set("brand")(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="gender">Género objetivo</Label>
        <Select
          id="gender"
          value={String(values.gender ?? "unisex")}
          onChange={(e) => set("gender")(e.target.value as ProductGender)}
        >
          <option value="unisex">Unisex</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="presentationMl">Presentación (ml)</Label>
        <Input
          id="presentationMl"
          type="number"
          min={0}
          step="1"
          value={values.presentationMl ?? 0}
          onChange={(e) => set("presentationMl")(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="image">Imagen del producto</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                set("imageDataUrl")(reader.result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
        {values.imageDataUrl ? (
          <Image
            src={String(values.imageDataUrl)}
            alt="Vista previa"
            width={80}
            height={80}
            unoptimized
            className="mt-2 h-20 w-20 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
          />
        ) : null}
      </div>

      <div>
        <Label htmlFor="cost">Costo</Label>
        <Input id="cost" type="number" min={0} step="0.01" value={values.cost ?? 0} onChange={(e) => set("cost")(Number(e.target.value))} />
      </div>
      <div>
        <Label htmlFor="price">Precio al publico</Label>
        <Input id="price" type="number" min={0} step="0.01" value={values.price ?? 0} onChange={(e) => set("price")(Number(e.target.value))} />
      </div>

      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" type="number" min={0} step="1" value={values.stock ?? 0} onChange={(e) => set("stock")(Number(e.target.value))} />
      </div>
      <div>
        <Label htmlFor="minStock">Stock mínimo (alerta)</Label>
        <Input
          id="minStock"
          type="number"
          min={0}
          step="1"
          value={values.minStock ?? 0}
          onChange={(e) => set("minStock")(Number(e.target.value))}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" value={String(values.notes ?? "")} onChange={(e) => set("notes")(e.target.value)} />
      </div>

      <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : initial ? "Actualizar" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

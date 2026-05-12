"use client";

import { useEffect, useState } from "react";
import type { AppSettings } from "@/lib/domain/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { ValidationError } from "@/lib/domain/validators";

export function SettingsForm({
  initial,
  onSave,
}: {
  initial: AppSettings;
  onSave: (s: AppSettings) => Promise<void>;
}) {
  const [values, setValues] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await onSave(values);
      setMessage("Guardado correctamente.");
    } catch (err) {
      setError(err instanceof ValidationError ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          {message}
        </div>
      )}

      <div>
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input
          id="businessName"
          value={values.businessName}
          onChange={(e) => setValues((v) => ({ ...v, businessName: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Dirección (aparece en tickets)</Label>
        <Textarea
          id="address"
          value={values.address}
          onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="currency">Moneda (ISO)</Label>
          <Input id="currency" value={values.currency} onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label htmlFor="taxRate">Tasa de impuesto (0–1)</Label>
        <Input
          id="taxRate"
          type="number"
          min={0}
          max={1}
          step="0.01"
          value={values.taxRate}
          onChange={(e) => setValues((v) => ({ ...v, taxRate: Number(e.target.value) }))}
        />
        <p className="mt-1 text-xs text-zinc-500">Ejemplo: 0.16 para 16% IVA.</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}

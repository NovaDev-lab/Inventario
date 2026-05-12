"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { downloadBackupJson, importBackupJsonFile } from "@/lib/backup/backup.service";

export function BackupPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onExport() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      await downloadBackupJson();
      setMsg("Respaldo descargado.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al exportar.");
    } finally {
      setBusy(false);
    }
  }

  async function onImport(mode: "replace" | "merge") {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErr("Selecciona un archivo JSON.");
      return;
    }
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await importBackupJsonFile(file, mode);
      setMsg(`Importación OK: ${res.products} productos, ${res.sales} ventas.`);
      if (inputRef.current) inputRef.current.value = "";
      window.location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al importar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid max-w-2xl gap-4">
      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          {msg}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Exportar respaldo</div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Descarga un JSON con inventario, ventas y configuración. Guárdalo en un lugar seguro (USB, correo, Drive).
        </p>
        <div className="mt-3">
          <Button type="button" onClick={onExport} disabled={busy}>
            Descargar JSON
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Importar respaldo</div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          <strong>Reemplazar</strong> borra todo lo local y restaura el archivo. <strong>Fusionar</strong> sobrescribe/actualiza por ID.
        </p>
        <input ref={inputRef} type="file" accept="application/json,.json" className="mt-3 block w-full text-sm" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void onImport("merge")}>
            Fusionar
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={() => void onImport("replace")}>
            Reemplazar todo
          </Button>
        </div>
      </div>
    </div>
  );
}

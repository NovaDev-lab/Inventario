"use client";

import { useDbReady } from "@/lib/hooks/useDbReady";
import { useSettings } from "@/lib/hooks/useSettings";
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "@/components/configuracion/SettingsForm";
import { BackupPanel } from "@/components/configuracion/BackupPanel";

export default function ConfiguracionPage() {
  const { ready, error } = useDbReady();
  const { settings, save } = useSettings(ready);

  if (error) {
    return (
      <Card title="Error">
        <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </Card>
    );
  }

  if (!ready || !settings) {
    return (
      <Card title="Cargando…">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Abriendo base de datos local.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Datos del negocio, impuestos y respaldos locales.</p>
      </div>

      <Card title="Negocio" subtitle="Se usa en tickets y PDFs">
        <SettingsForm
          initial={settings}
          onSave={async (s) => {
            await save(s);
          }}
        />
      </Card>

      <Card title="Respaldo" subtitle="Exporta/importa todo el sistema">
        <BackupPanel />
      </Card>
    </div>
  );
}

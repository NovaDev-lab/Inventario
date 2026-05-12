"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "@/lib/domain/types";
import { loadSettings, saveSettings } from "@/lib/services/settings.service";
import { ValidationError } from "@/lib/domain/validators";

export function useSettings(ready: boolean) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      setSettings(await loadSettings());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar configuración.");
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (input: Partial<AppSettings>) => {
      try {
        const base = settings ?? (await loadSettings());
        const next = await saveSettings({ ...base, ...input });
        setSettings(next);
        return next;
      } catch (e) {
        if (e instanceof ValidationError) throw e;
        throw e;
      }
    },
    [settings],
  );

  return { settings, loading, error, refresh, save };
}

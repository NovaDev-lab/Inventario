"use client";

import { useCallback, useEffect, useState } from "react";
import { getDb } from "@/lib/db/indexeddb";

export function useDbReady(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      await getDb();
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir la base de datos local.");
    }
  }, []);

  useEffect(() => {
    void init();
  }, [init]);

  return { ready, error };
}

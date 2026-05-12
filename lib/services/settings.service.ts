import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/domain/types";
import { parseSettingsInput, ValidationError } from "@/lib/domain/validators";
import { getSettings, putSettings } from "@/lib/db/indexeddb";

export async function loadSettings(): Promise<AppSettings> {
  const existing = await getSettings();
  if (existing) return existing;
  await putSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveSettings(input: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings();
  const merged = { ...current, ...input };
  try {
    const parsed = parseSettingsInput(merged);
    await putSettings(parsed);
    return parsed;
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    throw e;
  }
}

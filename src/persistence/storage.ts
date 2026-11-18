import { STORAGE_KEY } from "../domain/constants";
import type { AppData } from "../domain/types";

/**
 * INTEGRACIÓN: adaptador local.
 * Un backend reemplazaría loadState/saveState/clearState.
 * La clave `canasta.v1` es lo único que Canasta lee o borra.
 */

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as AppData;
  return (
    data.version === 1 &&
    Array.isArray(data.expenses) &&
    Array.isArray(data.products) &&
    Array.isArray(data.habits) &&
    Array.isArray(data.checkIns) &&
    Array.isArray(data.challenges) &&
    Array.isArray(data.reminders) &&
    Array.isArray(data.dismissedReminders) &&
    data.settings?.currency === "MXN" &&
    typeof data.settings.monthlyBudget === "number" &&
    typeof data.settings.weeklyBudget === "number" &&
    typeof data.settings.timezone === "string" &&
    typeof data.settings.demoMode === "boolean"
  );
}

export function loadState(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAppData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Si el navegador bloquea el almacenamiento, el siguiente guardado lo va a indicar.
  }
}

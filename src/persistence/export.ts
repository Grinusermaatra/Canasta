import { categoryName, storeName } from "../domain/constants";
import { formatQty } from "../domain/money";
import type { AppData } from "../domain/types";

/** INTEGRACIÓN: la descarga se queda en el dispositivo. No se envía a un servidor. */

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows: Array<Array<string | number>>): string {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
}

export function buildExportJson(data: AppData): string {
  return JSON.stringify(
    {
      _aviso: "Exportación local de Canasta. No proviene de una tienda ni de un servidor.",
      ...data,
    },
    null,
    2,
  );
}

export function buildExpensesCsv(data: AppData): string {
  const rows: Array<Array<string | number>> = [
    ["fecha", "tienda", "categoria", "importe", "nota", "articulos"],
  ];
  const expenses = [...data.expenses].sort((a, b) => a.date.localeCompare(b.date));
  for (const expense of expenses) {
    const articles = expense.items
      .map((item) => `${item.name} ${formatQty(item.quantity, item.unit)}`)
      .join("; ");
    rows.push([
      expense.date,
      storeName(expense.storeId),
      categoryName(expense.category),
      expense.amount.toFixed(2),
      expense.note,
      articles,
    ]);
  }
  return toCsv(rows);
}

export function buildHabitsCsv(data: AppData): string {
  const names = new Map(data.habits.map((habit) => [habit.id, habit.name]));
  const rows: Array<Array<string | number>> = [["fecha", "habito"]];
  const checkIns = [...data.checkIns].sort((a, b) => a.date.localeCompare(b.date) || a.habitId.localeCompare(b.habitId));
  for (const checkIn of checkIns) {
    rows.push([checkIn.date, names.get(checkIn.habitId) ?? checkIn.habitId]);
  }
  return toCsv(rows);
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMXN(value: number): string {
  return currency.format(money(value));
}

export function lineTotal(quantity: number, unitPrice: number): number {
  return money(quantity * unitPrice);
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\$/g, "").replace(/\s/g, "");
  if (!cleaned) return null;
  let normalized = cleaned;
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) normalized = cleaned.replace(/,/g, "");
  else if (cleaned.includes(",") && !cleaned.includes(".")) normalized = cleaned.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return value;
}

export function amountToInput(value: number): string {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value);
}

export function formatQty(quantity: number, unit: string): string {
  const amount = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(quantity);
  if (unit === "paquete") return `${amount} ${quantity === 1 ? "paquete" : "paquetes"}`;
  if (unit === "pza") return `${amount} ${quantity === 1 ? "pza" : "pzas"}`;
  return `${amount} ${unit}`;
}

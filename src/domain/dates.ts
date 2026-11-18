export function parseISODate(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function toISODate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { y, m, d } = parseISODate(value);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function todayISO(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function timeInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = (parts.find((part) => part.type === "hour")?.value ?? "00").slice(-2);
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour === "24" ? "00" : hour}:${minute}`;
}

export function addDays(iso: string, days: number): string {
  const { y, m, d } = parseISODate(iso);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function weekdayIndex(iso: string): number {
  const { y, m, d } = parseISODate(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const WEEKDAYS_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function weekdayShort(iso: string): string {
  return WEEKDAYS[weekdayIndex(iso)] ?? "";
}

export function weekdayLong(index: number): string {
  return WEEKDAYS_LONG[index] ?? "";
}

export function startOfWeek(iso: string): string {
  const weekday = weekdayIndex(iso);
  const delta = weekday === 0 ? -6 : 1 - weekday;
  return addDays(iso, delta);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 8)}01`;
}

export function endOfMonth(iso: string): string {
  const { y, m } = parseISODate(iso);
  const date = new Date(Date.UTC(y, m, 0));
  return toISODate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function monthToDate(today: string): { start: string; end: string } {
  return { start: startOfMonth(today), end: today };
}

export function weekToDate(today: string): { start: string; end: string } {
  return { start: startOfWeek(today), end: today };
}

export function previousWeek(today: string): { start: string; end: string } {
  const start = addDays(startOfWeek(today), -7);
  return { start, end: addDays(start, 6) };
}

function utcDate(iso: string): Date {
  const { y, m, d } = parseISODate(iso);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDayMonth(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(utcDate(iso));
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate(iso));
}

export function formatMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

export function greeting(now: Date, timeZone: string): string {
  const hour = Number(timeInZone(now, timeZone).slice(0, 2));
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
    if (dates.length > 370) break;
  }
  return dates;
}

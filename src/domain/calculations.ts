import { categoryName, storeName } from "./constants";
import { addDays, endOfMonth, formatDayMonth, isISODate, startOfMonth, startOfWeek } from "./dates";
import { formatMXN, lineTotal, money } from "./money";
import { normalize } from "./text";
import type { CategoryId, Challenge, CheckIn, Expense, Offer, OfferStoreId, Product } from "./types";

export interface WeekPoint {
  start: string;
  label: string;
  amount: number;
}

export interface CategorySpend {
  category: CategoryId;
  name: string;
  amount: number;
}

export interface PricePoint {
  date: string;
  unitPrice: number;
  unit: string;
  storeId: string;
  quantity: number;
  expenseId: string;
  createdAt: string;
}

export interface ChallengeProgress {
  current: number;
  target: number;
  ratio: number;
  tone: "ok" | "over" | "met" | "paused";
  statusLabel: string;
  detail: string;
}

export type OfferStoreFilter = "todas" | OfferStoreId;
export type OfferTiming = "current" | "upcoming" | "expired";

function inRange(date: string, start: string, end: string): boolean {
  return isISODate(date) && date >= start && date <= end;
}

export function sumExpenses(expenses: Expense[], start: string, end: string): number {
  return money(
    expenses.reduce((total, expense) => {
      if (!inRange(expense.date, start, end)) return total;
      return total + (Number.isFinite(expense.amount) ? expense.amount : 0);
    }, 0),
  );
}

export function spendByCategory(expenses: Expense[], start: string, end: string): CategorySpend[] {
  const totals = new Map<CategoryId, number>();
  for (const expense of expenses) {
    if (!inRange(expense.date, start, end)) continue;
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, name: categoryName(category), amount: money(amount) }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function weekSeries(expenses: Expense[], today: string, weeks = 6): WeekPoint[] {
  const current = startOfWeek(today);
  const points: WeekPoint[] = [];
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const start = addDays(current, -7 * index);
    const end = addDays(start, 6);
    points.push({
      start,
      label: formatDayMonth(start).replace(".", ""),
      amount: sumExpenses(expenses, start, end),
    });
  }
  return points;
}

export function monthOptions(expenses: Expense[], today: string): { value: string; label: string }[] {
  const keys = new Set<string>([today.slice(0, 7)]);
  for (const expense of expenses) {
    if (isISODate(expense.date)) keys.add(expense.date.slice(0, 7));
  }
  return [...keys]
    .sort()
    .reverse()
    .map((value) => ({
      value,
      label: new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(Date.UTC(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1)),
      ),
    }));
}

export function filterExpenses(
  expenses: Expense[],
  filters: { month: string; category: string; store: string },
): Expense[] {
  return expenses
    .filter((expense) => (filters.month === "todos" ? true : expense.date.slice(0, 7) === filters.month))
    .filter((expense) => (filters.category === "todas" ? true : expense.category === filters.category))
    .filter((expense) => (filters.store === "todas" ? true : expense.storeId === filters.store))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function pricePoints(expenses: Expense[], productId: string): PricePoint[] {
  const points: PricePoint[] = [];
  for (const expense of expenses) {
    for (const item of expense.items) {
      if (item.productId !== productId || item.quantity <= 0) continue;
      points.push({
        date: expense.date,
        unitPrice: item.unitPrice,
        unit: item.unit,
        storeId: expense.storeId,
        quantity: item.quantity,
        expenseId: expense.id,
        createdAt: expense.createdAt,
      });
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}

export function habitDates(checkIns: CheckIn[]): Set<string> {
  return new Set(checkIns.filter((checkIn) => isISODate(checkIn.date)).map((checkIn) => checkIn.date));
}

export function habitStreak(checkIns: CheckIn[], today: string): number {
  const dates = habitDates(checkIns);
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (dates.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
    if (count > 400) break;
  }
  return count;
}

export function habitCount(checkIns: CheckIn[], habitId: string, start: string, end: string): number {
  return new Set(
    checkIns.filter((checkIn) => checkIn.habitId === habitId && inRange(checkIn.date, start, end)).map((checkIn) => checkIn.date),
  ).size;
}

function challengeTone(
  challenge: Challenge,
  numericTone: "ok" | "over" | "met",
  numericLabel: string,
): Pick<ChallengeProgress, "tone" | "statusLabel"> {
  if (challenge.status === "paused") return { tone: "paused", statusLabel: "En pausa" };
  if (challenge.status === "completed") return { tone: "met", statusLabel: "Cumplido" };
  return { tone: numericTone, statusLabel: numericLabel };
}

export function challengeProgress(
  challenge: Challenge,
  expenses: Expense[],
  checkIns: CheckIn[],
  today: string,
): ChallengeProgress {
  const target = challenge.target > 0 ? challenge.target : 1;
  let current = 0;
  let detail = "";
  let numericTone: "ok" | "over" | "met" = "ok";
  let numericLabel = "En curso";

  if (challenge.kind === "weekly_spend_cap") {
    const start = startOfWeek(today);
    const end = addDays(start, 6);
    current = sumExpenses(expenses, start, end);
    if (current > challenge.target) {
      numericTone = "over";
      numericLabel = "Arriba de la meta";
      detail = `Esta semana va en ${formatMXN(current)}, arriba de la meta de ${formatMXN(challenge.target)}. El conteo es de lunes a domingo.`;
    } else {
      detail = `Llevas ${formatMXN(current)} de ${formatMXN(challenge.target)} esta semana, de lunes a domingo.`;
    }
  } else if (challenge.kind === "habit_days") {
    current = habitCount(checkIns, challenge.habitId ?? "", challenge.startDate, challenge.endDate);
    detail = `${current} de ${challenge.target} días con este hábito entre el ${formatDayMonth(challenge.startDate)} y el ${formatDayMonth(challenge.endDate)}.`;
    if (current >= challenge.target) {
      numericTone = "met";
      numericLabel = "Meta alcanzada";
    }
  } else {
    current = new Set(challenge.checkDates.filter((date) => inRange(date, challenge.startDate, challenge.endDate))).size;
    const verb = challenge.kind === "price_checks" ? "comparaciones" : "registros";
    detail = `${current} de ${challenge.target} ${verb} entre el ${formatDayMonth(challenge.startDate)} y el ${formatDayMonth(challenge.endDate)}.`;
    if (current >= challenge.target) {
      numericTone = "met";
      numericLabel = "Meta alcanzada";
    }
  }

  const status = challengeTone(challenge, numericTone, numericLabel);
  return {
    current,
    target: challenge.target,
    ratio: current / target,
    tone: status.tone,
    statusLabel: status.statusLabel,
    detail,
  };
}

export function orderedProducts(products: Product[]): Product[] {
  const staples = products.filter((product) => product.staple);
  const custom = products
    .filter((product) => !product.staple)
    .sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  return [...staples, ...custom];
}

export function offerSavings(offer: Offer): number {
  return money(offer.regularPrice - offer.price);
}

export function offerTiming(offer: Offer, today: string): OfferTiming {
  if (today < offer.validFrom) return "upcoming";
  if (today > offer.validUntil) return "expired";
  return "current";
}

export function filterOffers(offers: Offer[], query: string, store: OfferStoreFilter, today: string): Offer[] {
  const needle = normalize(query);
  return offers
    .filter((offer) => store === "todas" || offer.storeId === store)
    .filter((offer) => {
      if (!needle) return true;
      return normalize(offer.productName).includes(needle) || normalize(storeName(offer.storeId)).includes(needle);
    })
    .sort((a, b) => {
      const timingScore = (offer: Offer) => (offerTiming(offer, today) === "current" ? 1 : 0);
      const byTiming = timingScore(b) - timingScore(a);
      if (byTiming !== 0) return byTiming;
      return offerSavings(b) - offerSavings(a);
    });
}

export function featuredOffers(offers: Offer[], today: string, limit = 3): Offer[] {
  return filterOffers(offers, "", "todas", today)
    .filter((offer) => offerTiming(offer, today) === "current")
    .slice(0, limit);
}

export function calendarCells(today: string): { date: string; inMonth: boolean }[] {
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const cells: { date: string; inMonth: boolean }[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    cells.push({ date: cursor, inMonth: cursor.slice(0, 7) === today.slice(0, 7) });
    cursor = addDays(cursor, 1);
  }
  return cells;
}

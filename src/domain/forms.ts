import { isCategoryId, isStoreId } from "./constants";
import { addDays, isISODate, startOfWeek } from "./dates";
import { createId } from "./ids";
import { lineTotal, money, parseAmount } from "./money";
import { normalize } from "./text";
import type { CategoryId, Challenge, ChallengeKind, ChallengeStatus, Expense, Product, Unit } from "./types";

export interface ItemDraft {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
  unitPrice: string;
}

export interface ExpenseDraft {
  id?: string;
  createdAt?: string;
  date: string;
  storeId: string;
  category: string;
  amount: string;
  note: string;
  items: ItemDraft[];
}

export interface ExpenseErrors {
  form?: string;
  date?: string;
  storeId?: string;
  category?: string;
  amount?: string;
  note?: string;
  items?: Record<string, { name?: string; quantity?: string; unitPrice?: string }>;
}

export interface BasketDraft {
  productId: string;
  name: string;
  category: CategoryId | "";
  date: string;
  storeId: string;
  quantity: string;
  unit: Unit;
  unitPrice: string;
}

export interface BasketErrors {
  form?: string;
  name?: string;
  category?: string;
  date?: string;
  storeId?: string;
  quantity?: string;
  unitPrice?: string;
}

export interface ChallengeDraft {
  id?: string;
  preset: boolean;
  title: string;
  description: string;
  kind: ChallengeKind;
  target: string;
  habitId: string;
  reward: string;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  checkDates: string[];
}

export interface ChallengeErrors {
  form?: string;
  title?: string;
  description?: string;
  target?: string;
  habitId?: string;
  reward?: string;
  startDate?: string;
  endDate?: string;
}

export function blankExpenseDraft(today: string): ExpenseDraft {
  return { date: today, storeId: "", category: "", amount: "", note: "", items: [] };
}

export function expenseToDraft(expense: Expense): ExpenseDraft {
  return {
    id: expense.id,
    createdAt: expense.createdAt,
    date: expense.date,
    storeId: expense.storeId,
    category: expense.category,
    amount: String(expense.amount),
    note: expense.note,
    items: expense.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      unitPrice: String(item.unitPrice),
    })),
  };
}

export function blankItemDraft(): ItemDraft {
  return { id: createId(), name: "", quantity: "1", unit: "kg", unitPrice: "" };
}

export function validateExpense(draft: ExpenseDraft, today: string): ExpenseErrors {
  const errors: ExpenseErrors = {};
  if (!draft.date) errors.date = "Elige una fecha.";
  else if (!isISODate(draft.date)) errors.date = "Esa fecha no es válida.";
  else if (draft.date > today) errors.date = "Elige hoy o un día anterior.";

  if (!isStoreId(draft.storeId)) errors.storeId = "Elige una tienda.";
  if (!isCategoryId(draft.category)) errors.category = "Elige una categoría.";
  if (draft.note.trim().length > 160) errors.note = "La nota puede tener hasta 160 caracteres.";
  if (draft.items.length > 30) errors.form = "Puedes desglosar hasta 30 artículos.";

  if (draft.items.length === 0) {
    const amount = parseAmount(draft.amount);
    if (amount === null) errors.amount = "Escribe el importe con números, por ejemplo 186.50.";
    else if (amount <= 0) errors.amount = "Escribe un importe mayor a cero.";
  } else {
    const itemErrors: NonNullable<ExpenseErrors["items"]> = {};
    for (const item of draft.items) {
      const row: { name?: string; quantity?: string; unitPrice?: string } = {};
      if (item.name.trim().length < 2) row.name = "Escribe el nombre del artículo.";
      const quantity = parseAmount(item.quantity);
      if (quantity === null || quantity <= 0) row.quantity = "La cantidad debe ser mayor a cero.";
      const price = parseAmount(item.unitPrice);
      if (price === null || price <= 0) row.unitPrice = "El precio debe ser mayor a cero.";
      if (row.name || row.quantity || row.unitPrice) itemErrors[item.id] = row;
    }
    if (Object.keys(itemErrors).length > 0) errors.items = itemErrors;
  }

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some((value) => {
    if (!value) return false;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  });
}

export function linkProductId(name: string, products: Product[]): string | undefined {
  const needle = normalize(name);
  return products.find((product) => normalize(product.name) === needle)?.id;
}

export function toExpense(draft: ExpenseDraft, products: Product[]): Expense {
  const items = draft.items.map((item) => {
    const quantity = parseAmount(item.quantity) ?? 0;
    const unitPrice = parseAmount(item.unitPrice) ?? 0;
    return {
      id: item.id || createId(),
      productId: linkProductId(item.name, products),
      name: item.name.trim(),
      quantity,
      unit: item.unit,
      unitPrice: money(unitPrice),
    };
  });
  const amount =
    items.length > 0
      ? money(items.reduce((total, item) => total + lineTotal(item.quantity, item.unitPrice), 0))
      : money(parseAmount(draft.amount) ?? 0);

  return {
    id: draft.id || createId(),
    date: draft.date,
    storeId: draft.storeId as Expense["storeId"],
    category: draft.category as Expense["category"],
    amount,
    note: draft.note.trim(),
    items,
    createdAt: draft.createdAt || new Date().toISOString(),
  };
}

export function blankBasketDraft(today: string, product?: Product): BasketDraft {
  return {
    productId: product?.id ?? "leche",
    name: "",
    category: "",
    date: today,
    storeId: "",
    quantity: "1",
    unit: product?.defaultUnit ?? "L",
    unitPrice: "",
  };
}

export function validateBasket(draft: BasketDraft, today: string, products: Product[]): BasketErrors {
  const errors: BasketErrors = {};
  if (draft.productId === "otro") {
    if (draft.name.trim().length < 2) errors.name = "Escribe el nombre del producto.";
    if (!isCategoryId(draft.category)) errors.category = "Elige una categoría.";
  } else if (!products.some((product) => product.id === draft.productId)) {
    errors.form = "Elige un producto de la lista.";
  }
  if (!draft.date) errors.date = "Elige una fecha.";
  else if (!isISODate(draft.date)) errors.date = "Esa fecha no es válida.";
  else if (draft.date > today) errors.date = "Elige hoy o un día anterior.";
  if (!isStoreId(draft.storeId)) errors.storeId = "Elige una tienda.";
  const quantity = parseAmount(draft.quantity);
  if (quantity === null || quantity <= 0) errors.quantity = "La cantidad debe ser mayor a cero.";
  const price = parseAmount(draft.unitPrice);
  if (price === null || price <= 0) errors.unitPrice = "El precio debe ser mayor a cero.";
  return errors;
}

export function blankChallengeDraft(today: string): ChallengeDraft {
  return {
    preset: false,
    title: "",
    description: "",
    kind: "weekly_spend_cap",
    target: "1200",
    habitId: "fruta",
    reward: "",
    status: "active",
    startDate: today,
    endDate: addDays(today, 7),
    checkDates: [],
  };
}

export function challengeToDraft(challenge: Challenge): ChallengeDraft {
  return {
    id: challenge.id,
    preset: challenge.preset,
    title: challenge.title,
    description: challenge.description,
    kind: challenge.kind,
    target: String(challenge.target),
    habitId: challenge.habitId ?? "fruta",
    reward: challenge.reward,
    status: challenge.status,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    checkDates: challenge.checkDates,
  };
}

export function validateChallenge(draft: ChallengeDraft): ChallengeErrors {
  const errors: ChallengeErrors = {};
  if (draft.title.trim().length < 3) errors.title = "Escribe un título un poco más claro.";
  if (draft.description.trim().length > 240) errors.description = "La descripción puede tener hasta 240 caracteres.";
  if (draft.reward.trim().length < 3) errors.reward = "Escribe una recompensa simbólica, aunque sea una frase corta.";
  const parsed = parseAmount(draft.target);
  const target = draft.kind === "weekly_spend_cap" ? parsed ?? 0 : Math.round(parsed ?? 0);
  if (parsed === null || target <= 0) {
    errors.target = draft.kind === "weekly_spend_cap" ? "Escribe un tope mayor a cero." : "La meta debe ser al menos 1.";
  }
  if (draft.kind === "habit_days" && !draft.habitId) errors.habitId = "Elige el hábito que quieres contar.";
  if (draft.kind !== "weekly_spend_cap") {
    if (!isISODate(draft.startDate)) errors.startDate = "Elige la fecha de inicio.";
    if (!isISODate(draft.endDate)) errors.endDate = "Elige la fecha final.";
    else if (isISODate(draft.startDate) && draft.endDate < draft.startDate) {
      errors.endDate = "La fecha final no puede ser anterior al inicio.";
    }
  }
  return errors;
}

export function toChallenge(draft: ChallengeDraft, today: string): Challenge {
  const parsed = parseAmount(draft.target) ?? 0;
  const target = draft.kind === "weekly_spend_cap" ? money(parsed) : Math.round(parsed);
  const start = draft.kind === "weekly_spend_cap" ? startOfWeek(today) : draft.startDate;
  const end = draft.kind === "weekly_spend_cap" ? addDays(start, 6) : draft.endDate;
  return {
    id: draft.id || createId(),
    preset: draft.preset,
    title: draft.title.trim(),
    description: draft.description.trim(),
    kind: draft.kind,
    target,
    habitId: draft.kind === "habit_days" ? draft.habitId : undefined,
    reward: draft.reward.trim(),
    status: draft.status,
    startDate: start,
    endDate: end,
    checkDates: draft.checkDates,
  };
}

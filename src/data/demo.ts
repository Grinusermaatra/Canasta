import { DEFAULT_TIMEZONE, HABITS, STAPLES } from "../domain/constants";
import { addDays, endOfMonth, startOfMonth } from "../domain/dates";
import { createId } from "../domain/ids";
import { lineTotal, money } from "../domain/money";
import type { AppData, CategoryId, Challenge, CheckIn, Expense, LineItem, Reminder, StoreId, Unit } from "../domain/types";
import { buildPreset } from "./presets";

interface SeedItem {
  productId: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
}

interface SeedTrip {
  daysAgo: number;
  storeId: StoreId;
  category: CategoryId;
  note?: string;
  amount?: number;
  items?: SeedItem[];
}

const TRIPS: SeedTrip[] = [
  {
    daysAgo: 38,
    storeId: "mercado",
    category: "frutas-verduras",
    note: "Fruta de la semana",
    items: [
      { productId: "jitomate", quantity: 1, unit: "kg", unitPrice: 26 },
      { productId: "limon", quantity: 1, unit: "kg", unitPrice: 30 },
      { productId: "platano", quantity: 1, unit: "kg", unitPrice: 20 },
    ],
  },
  {
    daysAgo: 34,
    storeId: "aurrera",
    category: "abarrotes",
    note: "Básicos de despensa",
    items: [
      { productId: "leche", quantity: 2, unit: "L", unitPrice: 25 },
      { productId: "frijol", quantity: 1, unit: "kg", unitPrice: 35 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 47 },
      { productId: "papa", quantity: 1, unit: "kg", unitPrice: 16 },
    ],
  },
  {
    daysAgo: 30,
    storeId: "walmart",
    category: "proteinas",
    items: [
      { productId: "huevo", quantity: 2, unit: "paquete", unitPrice: 60 },
      { productId: "tortilla", quantity: 2, unit: "kg", unitPrice: 25 },
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 37 },
      { productId: "pollo", quantity: 1, unit: "kg", unitPrice: 108 },
    ],
  },
  {
    daysAgo: 27,
    storeId: "soriana",
    category: "abarrotes",
    items: [
      { productId: "leche", quantity: 2, unit: "L", unitPrice: 27.5 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 52 },
      { productId: "frijol", quantity: 1, unit: "kg", unitPrice: 41 },
      { productId: "res", quantity: 0.7, unit: "kg", unitPrice: 179 },
    ],
  },
  {
    daysAgo: 24,
    storeId: "mercado",
    category: "frutas-verduras",
    note: "Tianguis",
    items: [
      { productId: "platano", quantity: 2, unit: "kg", unitPrice: 21 },
      { productId: "manzana", quantity: 1, unit: "kg", unitPrice: 55 },
      { productId: "cebolla", quantity: 2, unit: "kg", unitPrice: 18 },
      { productId: "papa", quantity: 2, unit: "kg", unitPrice: 15 },
    ],
  },
  {
    daysAgo: 22,
    storeId: "chedraui",
    category: "proteinas",
    items: [
      { productId: "pollo", quantity: 1.5, unit: "kg", unitPrice: 94 },
      { productId: "jitomate", quantity: 1.2, unit: "kg", unitPrice: 33 },
      { productId: "limon", quantity: 1, unit: "kg", unitPrice: 34 },
    ],
  },
  {
    daysAgo: 20,
    storeId: "aurrera",
    category: "abarrotes",
    items: [
      { productId: "frijol", quantity: 2, unit: "kg", unitPrice: 36 },
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 31 },
      { productId: "tortilla", quantity: 2, unit: "kg", unitPrice: 22 },
      { productId: "huevo", quantity: 1, unit: "paquete", unitPrice: 51 },
    ],
  },
  {
    daysAgo: 18,
    storeId: "walmart",
    category: "lacteos",
    items: [
      { productId: "leche", quantity: 3, unit: "L", unitPrice: 27.5 },
      { productId: "huevo", quantity: 1, unit: "paquete", unitPrice: 58 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 61 },
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 35 },
    ],
  },
  {
    daysAgo: 15,
    storeId: "mercado",
    category: "frutas-verduras",
    note: "Verdura para la semana",
    items: [
      { productId: "manzana", quantity: 1, unit: "kg", unitPrice: 49 },
      { productId: "jitomate", quantity: 1, unit: "kg", unitPrice: 28 },
      { productId: "cebolla", quantity: 1, unit: "kg", unitPrice: 21 },
      { productId: "papa", quantity: 1, unit: "kg", unitPrice: 18 },
      { productId: "platano", quantity: 1, unit: "kg", unitPrice: 23 },
    ],
  },
  {
    daysAgo: 13,
    storeId: "chedraui",
    category: "abarrotes",
    items: [
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 39 },
      { productId: "frijol", quantity: 1, unit: "kg", unitPrice: 45 },
      { productId: "leche", quantity: 2, unit: "L", unitPrice: 30 },
      { productId: "tortilla", quantity: 2, unit: "kg", unitPrice: 28 },
    ],
  },
  {
    daysAgo: 11,
    storeId: "walmart",
    category: "proteinas",
    items: [
      { productId: "pollo", quantity: 1.4, unit: "kg", unitPrice: 102 },
      { productId: "jitomate", quantity: 2, unit: "kg", unitPrice: 38 },
      { productId: "platano", quantity: 1.2, unit: "kg", unitPrice: 26 },
      { productId: "limon", quantity: 0.8, unit: "kg", unitPrice: 40 },
    ],
  },
  {
    daysAgo: 9,
    storeId: "soriana",
    category: "otros",
    note: "Ticket sin desglose",
    amount: 240,
  },
  {
    daysAgo: 8,
    storeId: "aurrera",
    category: "lacteos",
    note: "Reposición de la semana",
    items: [
      { productId: "leche", quantity: 4, unit: "L", unitPrice: 26 },
      { productId: "huevo", quantity: 2, unit: "paquete", unitPrice: 54 },
      { productId: "tortilla", quantity: 3, unit: "kg", unitPrice: 23 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 49 },
      { productId: "papa", quantity: 2, unit: "kg", unitPrice: 16 },
    ],
  },
  {
    daysAgo: 7,
    storeId: "soriana",
    category: "proteinas",
    items: [
      { productId: "res", quantity: 1.2, unit: "kg", unitPrice: 205 },
      { productId: "pollo", quantity: 1, unit: "kg", unitPrice: 99 },
    ],
  },
  {
    daysAgo: 6,
    storeId: "chedraui",
    category: "lacteos",
    items: [
      { productId: "leche", quantity: 2, unit: "L", unitPrice: 31 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 64 },
    ],
  },
  {
    daysAgo: 5,
    storeId: "mercado",
    category: "frutas-verduras",
    note: "Tianguis del barrio",
    items: [
      { productId: "jitomate", quantity: 1.5, unit: "kg", unitPrice: 30 },
      { productId: "cebolla", quantity: 1, unit: "kg", unitPrice: 19 },
      { productId: "papa", quantity: 2, unit: "kg", unitPrice: 17 },
      { productId: "platano", quantity: 1, unit: "kg", unitPrice: 22 },
      { productId: "limon", quantity: 1, unit: "kg", unitPrice: 36 },
      { productId: "manzana", quantity: 1, unit: "kg", unitPrice: 52 },
    ],
  },
  {
    daysAgo: 4,
    storeId: "aurrera",
    category: "abarrotes",
    items: [
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 32 },
      { productId: "frijol", quantity: 2, unit: "kg", unitPrice: 38 },
      { productId: "huevo", quantity: 1, unit: "paquete", unitPrice: 54 },
      { productId: "leche", quantity: 3, unit: "L", unitPrice: 26 },
      { productId: "tortilla", quantity: 2, unit: "kg", unitPrice: 24 },
    ],
  },
  {
    daysAgo: 3,
    storeId: "soriana",
    category: "proteinas",
    note: "Pollo y un poco de res",
    items: [
      { productId: "pollo", quantity: 1.6, unit: "kg", unitPrice: 96 },
      { productId: "res", quantity: 0.9, unit: "kg", unitPrice: 189 },
    ],
  },
  {
    daysAgo: 2,
    storeId: "walmart",
    category: "abarrotes",
    note: "Mandado grande",
    items: [
      { productId: "pollo", quantity: 1.2, unit: "kg", unitPrice: 105 },
      { productId: "res", quantity: 1, unit: "kg", unitPrice: 199 },
      { productId: "arroz", quantity: 2, unit: "kg", unitPrice: 34 },
      { productId: "frijol", quantity: 1, unit: "kg", unitPrice: 40 },
      { productId: "manzana", quantity: 1.5, unit: "kg", unitPrice: 48 },
      { productId: "cebolla", quantity: 1, unit: "kg", unitPrice: 22 },
    ],
  },
  {
    daysAgo: 1,
    storeId: "walmart",
    category: "abarrotes",
    note: "Súper del domingo",
    items: [
      { productId: "arroz", quantity: 1, unit: "kg", unitPrice: 36 },
      { productId: "frijol", quantity: 1, unit: "kg", unitPrice: 42 },
      { productId: "aceite", quantity: 1, unit: "L", unitPrice: 58 },
      { productId: "leche", quantity: 2, unit: "L", unitPrice: 29 },
    ],
  },
  {
    daysAgo: 0,
    storeId: "mercado",
    category: "frutas-verduras",
    note: "Tianguis de la mañana",
    items: [
      { productId: "platano", quantity: 1, unit: "kg", unitPrice: 24 },
      { productId: "limon", quantity: 0.5, unit: "kg", unitPrice: 42 },
      { productId: "jitomate", quantity: 0.8, unit: "kg", unitPrice: 34 },
    ],
  },
  {
    daysAgo: 0,
    storeId: "aurrera",
    category: "tortilla-pan",
    items: [{ productId: "tortilla", quantity: 1, unit: "kg", unitPrice: 26 }],
  },
  {
    daysAgo: 0,
    storeId: "chedraui",
    category: "proteinas",
    note: "Huevo de la semana",
    items: [{ productId: "huevo", quantity: 1, unit: "paquete", unitPrice: 62 }],
  },
];

function productName(productId: string): string {
  const product = STAPLES.find((item) => item.id === productId);
  if (!product) throw new Error(`Producto de demostración desconocido: ${productId}`);
  return product.name;
}

function buildExpenses(today: string): Expense[] {
  return TRIPS.map((trip, index) => {
    const date = addDays(today, -trip.daysAgo);
    const items: LineItem[] = (trip.items ?? []).map((item) => ({
      id: createId(),
      productId: item.productId,
      name: productName(item.productId),
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: money(item.unitPrice),
    }));
    const amount =
      items.length > 0 ? money(items.reduce((total, item) => total + lineTotal(item.quantity, item.unitPrice), 0)) : money(trip.amount ?? 0);
    return {
      id: createId(),
      date,
      storeId: trip.storeId,
      category: trip.category,
      amount,
      note: trip.note ?? "",
      items,
      createdAt: new Date(Date.parse(`${date}T12:00:00.000Z`) + index * 1000).toISOString(),
    };
  });
}

function buildCheckIns(today: string): CheckIn[] {
  const lastPrev = addDays(startOfMonth(today), -1);
  const past: CheckIn[] = [12, 13, 14, 15, 16].map((offset) => ({
    habitId: "agua",
    date: addDays(lastPrev, -offset),
  }));
  const recent: CheckIn[] = [
    ["fruta", 1],
    ["agua", 1],
    ["fruta", 2],
    ["casa", 2],
    ["agua", 3],
    ["fruta", 4],
    ["agua", 4],
    ["casa", 5],
  ].map(([habitId, daysAgo]) => ({ habitId, date: addDays(today, -Number(daysAgo)) }));
  const unique = new Map<string, CheckIn>();
  for (const checkIn of [...past, ...recent]) unique.set(`${checkIn.habitId}|${checkIn.date}`, checkIn);
  return [...unique.values()];
}

function buildChallenges(today: string): Challenge[] {
  const prices = buildPreset("preset-prices", today);
  const sample = addDays(today, -2);
  prices.checkDates = [sample >= prices.startDate && sample <= prices.endDate ? sample : today];
  const lastPrev = addDays(startOfMonth(today), -1);
  const closed: Challenge = {
    id: "reto-agua-pasado",
    title: "Agua en cinco días del mes pasado",
    description: "Un periodo que ya cerró. Sirve para ver cómo queda un reto cumplido.",
    kind: "habit_days",
    target: 5,
    habitId: "agua",
    reward: "Una constancia con el agua que ya quedó registrada.",
    status: "completed",
    startDate: startOfMonth(lastPrev),
    endDate: endOfMonth(lastPrev),
    checkDates: [],
    preset: false,
  };
  return [buildPreset("preset-spend", today), buildPreset("preset-fruit", today), prices, closed];
}

function buildReminders(): Reminder[] {
  return [
    {
      id: "compra",
      title: "Registrar la compra",
      body: "Si fuiste al súper o al tianguis, anótala mientras todavía recuerdas el ticket.",
      schedule: "daily",
      time: "09:00",
      enabled: true,
    },
    {
      id: "habitos",
      title: "Hábitos del día",
      body: "Un vistazo tranquilo: fruta o verdura, agua y comida en casa. No hace falta marcar todo.",
      schedule: "daily",
      time: "20:30",
      enabled: true,
    },
    {
      id: "semana",
      title: "¿Cómo va la semana?",
      body: "Revisa el gasto semanal frente a tu meta. Es solo para orientarte.",
      schedule: "weekly",
      weekday: 0,
      time: "18:00",
      enabled: true,
    },
    {
      id: "super",
      title: "Lista antes del súper",
      body: "Si vas a comparar precios, recuerda que las ofertas de la app son de ejemplo.",
      schedule: "weekly",
      weekday: 6,
      time: "10:00",
      enabled: true,
    },
  ];
}

export function buildDemo(today: string, timezone = DEFAULT_TIMEZONE): AppData {
  return {
    version: 1,
    settings: {
      currency: "MXN",
      monthlyBudget: 5000,
      weeklyBudget: 1800,
      timezone,
      demoMode: true,
    },
    products: STAPLES.map((product) => ({ ...product })),
    expenses: buildExpenses(today),
    habits: HABITS.map((habit) => ({ ...habit })),
    checkIns: buildCheckIns(today),
    challenges: buildChallenges(today),
    reminders: buildReminders(),
    dismissedReminders: [],
  };
}

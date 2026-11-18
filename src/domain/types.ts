export type StoreId = "walmart" | "aurrera" | "soriana" | "chedraui" | "mercado" | "otro";

export type CategoryId =
  | "abarrotes"
  | "lacteos"
  | "proteinas"
  | "frutas-verduras"
  | "tortilla-pan"
  | "aceites"
  | "otros";

export type Unit = "kg" | "g" | "L" | "ml" | "pza" | "paquete";

export interface LineItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
}

export interface Expense {
  id: string;
  date: string;
  storeId: StoreId;
  category: CategoryId;
  amount: number;
  note: string;
  items: LineItem[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  defaultUnit: Unit;
  staple: boolean;
}

export interface Habit {
  id: string;
  name: string;
  hint: string;
}

export interface CheckIn {
  habitId: string;
  date: string;
}

export type ChallengeKind = "weekly_spend_cap" | "habit_days" | "price_checks" | "custom_count";

export type ChallengeStatus = "active" | "completed" | "paused";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  kind: ChallengeKind;
  target: number;
  habitId?: string;
  reward: string;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  checkDates: string[];
  preset: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  body: string;
  schedule: "daily" | "weekly";
  weekday?: number;
  time: string;
  enabled: boolean;
}

export interface Settings {
  currency: "MXN";
  monthlyBudget: number;
  weeklyBudget: number;
  timezone: string;
  demoMode: boolean;
}

export interface AppData {
  version: 1;
  settings: Settings;
  products: Product[];
  expenses: Expense[];
  habits: Habit[];
  checkIns: CheckIn[];
  challenges: Challenge[];
  reminders: Reminder[];
  dismissedReminders: string[];
}

export type OfferStoreId = Extract<StoreId, "walmart" | "aurrera" | "soriana" | "chedraui">;

export interface Offer {
  id: string;
  productId: string;
  productName: string;
  storeId: OfferStoreId;
  price: number;
  regularPrice: number;
  unit: string;
  validFrom: string;
  validUntil: string;
  example: true;
}

export interface BasketPurchaseInput {
  productId: string | null;
  name: string;
  category: CategoryId;
  unit: Unit;
  date: string;
  storeId: StoreId;
  quantity: number;
  unitPrice: number;
}

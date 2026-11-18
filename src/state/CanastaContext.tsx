import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TIMEZONE, STORAGE_KEY } from "../domain/constants";
import { todayISO } from "../domain/dates";
import { createId } from "../domain/ids";
import { lineTotal } from "../domain/money";
import { buildDemo } from "../data/demo";
import { buildOffers } from "../data/offers";
import { clearState, loadState, saveState } from "../persistence/storage";
import type {
  AppData,
  BasketPurchaseInput,
  Challenge,
  ChallengeStatus,
  Expense,
  Offer,
  Reminder,
  Settings,
} from "../domain/types";

interface CanastaApi {
  data: AppData;
  now: Date;
  today: string;
  offers: Offer[];
  persistError: boolean;
  toast: string | null;
  notify: (message: string) => void;
  saveExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addBasketPurchase: (input: BasketPurchaseInput) => void;
  removeCustomProduct: (id: string) => void;
  toggleCheckIn: (habitId: string, date: string) => void;
  saveChallenge: (challenge: Challenge) => void;
  deleteChallenge: (id: string) => void;
  setChallengeStatus: (id: string, status: ChallengeStatus) => void;
  toggleChallengeLog: (id: string, date: string) => void;
  saveSettings: (settings: Settings, reminders: Reminder[]) => void;
  dismissReminder: (occurrenceId: string) => void;
  restoreDemo: () => void;
}

const CanastaContext = createContext<CanastaApi | null>(null);

export function CanastaProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<AppData>(() => loadState() ?? buildDemo(todayISO(DEFAULT_TIMEZONE), DEFAULT_TIMEZONE));
  const [persistError, setPersistError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const today = todayISO(data.settings.timezone, now);
  const offers = useMemo(() => buildOffers(today), [today]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setPersistError(!saveState(data));
  }, [data]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = loadState();
      if (next) setData(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const api: CanastaApi = {
    data,
    now,
    today,
    offers,
    persistError,
    toast,
    notify: (message) => setToast(message),
    saveExpense: (expense) => {
      setData((prev) => {
        const exists = prev.expenses.some((item) => item.id === expense.id);
        return {
          ...prev,
          expenses: exists ? prev.expenses.map((item) => (item.id === expense.id ? expense : item)) : [expense, ...prev.expenses],
        };
      });
    },
    deleteExpense: (id) => {
      setData((prev) => ({ ...prev, expenses: prev.expenses.filter((expense) => expense.id !== id) }));
    },
    addBasketPurchase: (input) => {
      setData((prev) => {
        let products = prev.products;
        let product = input.productId ? products.find((item) => item.id === input.productId) : undefined;
        if (!product) {
          product = {
            id: createId(),
            name: input.name.trim(),
            category: input.category,
            defaultUnit: input.unit,
            staple: false,
          };
          products = [...products, product];
        }
        const expense: Expense = {
          id: createId(),
          date: input.date,
          storeId: input.storeId,
          category: product.category,
          note: "Compra registrada desde la canasta básica.",
          createdAt: new Date().toISOString(),
          amount: lineTotal(input.quantity, input.unitPrice),
          items: [
            {
              id: createId(),
              productId: product.id,
              name: product.name,
              quantity: input.quantity,
              unit: input.unit,
              unitPrice: input.unitPrice,
            },
          ],
        };
        return { ...prev, products, expenses: [expense, ...prev.expenses] };
      });
    },
    removeCustomProduct: (id) => {
      setData((prev) => ({
        ...prev,
        products: prev.products.filter((product) => product.id !== id || product.staple),
      }));
    },
    toggleCheckIn: (habitId, date) => {
      setData((prev) => {
        const exists = prev.checkIns.some((checkIn) => checkIn.habitId === habitId && checkIn.date === date);
        return {
          ...prev,
          checkIns: exists
            ? prev.checkIns.filter((checkIn) => !(checkIn.habitId === habitId && checkIn.date === date))
            : [...prev.checkIns, { habitId, date }],
        };
      });
    },
    saveChallenge: (challenge) => {
      setData((prev) => {
        const exists = prev.challenges.some((item) => item.id === challenge.id);
        return {
          ...prev,
          challenges: exists
            ? prev.challenges.map((item) => (item.id === challenge.id ? challenge : item))
            : [challenge, ...prev.challenges],
        };
      });
    },
    deleteChallenge: (id) => {
      setData((prev) => ({ ...prev, challenges: prev.challenges.filter((challenge) => challenge.id !== id) }));
    },
    setChallengeStatus: (id, status) => {
      setData((prev) => ({
        ...prev,
        challenges: prev.challenges.map((challenge) => (challenge.id === id ? { ...challenge, status } : challenge)),
      }));
    },
    toggleChallengeLog: (id, date) => {
      setData((prev) => ({
        ...prev,
        challenges: prev.challenges.map((challenge) => {
          if (challenge.id !== id) return challenge;
          const has = challenge.checkDates.includes(date);
          const checkDates = has
            ? challenge.checkDates.filter((item) => item !== date)
            : [...challenge.checkDates, date].sort();
          return { ...challenge, checkDates };
        }),
      }));
    },
    saveSettings: (settings, reminders) => {
      setData((prev) => ({ ...prev, settings, reminders }));
    },
    dismissReminder: (occurrenceId) => {
      setData((prev) =>
        prev.dismissedReminders.includes(occurrenceId)
          ? prev
          : { ...prev, dismissedReminders: [...prev.dismissedReminders, occurrenceId] },
      );
    },
    restoreDemo: () => {
      clearState();
      setData((prev) => buildDemo(todayISO(prev.settings.timezone), prev.settings.timezone));
    },
  };

  return <CanastaContext.Provider value={api}>{children}</CanastaContext.Provider>;
}

export function useCanasta(): CanastaApi {
  const value = useContext(CanastaContext);
  if (!value) throw new Error("useCanasta debe usarse dentro de CanastaProvider");
  return value;
}

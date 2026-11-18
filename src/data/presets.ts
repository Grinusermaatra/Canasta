import { addDays, endOfMonth, startOfMonth, startOfWeek } from "../domain/dates";
import type { Challenge } from "../domain/types";

export type PresetId = "preset-spend" | "preset-fruit" | "preset-prices";

export function buildPreset(id: PresetId, today: string): Challenge {
  if (id === "preset-spend") {
    const start = startOfWeek(today);
    return {
      id,
      title: "Mantener el gasto semanal debajo de $1,200",
      description: "Se mide cada semana, de lunes a domingo, con las compras que registres.",
      kind: "weekly_spend_cap",
      target: 1200,
      reward: "Ver la semana con más calma. No es un premio de dinero.",
      status: "active",
      startDate: start,
      endDate: addDays(start, 6),
      checkDates: [],
      preset: true,
    };
  }
  if (id === "preset-fruit") {
    return {
      id,
      title: "Añadir fruta o verdura 5 días",
      description: "Cuenta los días en que marcas fruta o verdura. No tiene que ser todos ni seguidos.",
      kind: "habit_days",
      target: 5,
      habitId: "fruta",
      reward: "Notar la fruta que sí entró a la casa.",
      status: "active",
      startDate: addDays(today, -6),
      endDate: addDays(today, 7),
      checkDates: [],
      preset: true,
    };
  }
  return {
    id,
    title: "Comparar precios antes de comprar",
    description: "Anota cada vez que compares el mismo producto. Las ofertas de la app son de ejemplo, no un anuncio.",
    kind: "price_checks",
    target: 4,
    reward: "Una decisión de compra más comparada.",
    status: "active",
    startDate: startOfMonth(today),
    endDate: endOfMonth(today),
    checkDates: [],
    preset: true,
  };
}

import type { CategoryId, Habit, Product, StoreId, Unit } from "./types";

export const DEFAULT_TIMEZONE = "America/Mexico_City";
export const STORAGE_KEY = "canasta.v1";

export const STORES: { id: StoreId; name: string }[] = [
  { id: "walmart", name: "Walmart" },
  { id: "aurrera", name: "Bodega Aurrera" },
  { id: "soriana", name: "Soriana" },
  { id: "chedraui", name: "Chedraui" },
  { id: "mercado", name: "Mercado / tianguis" },
  { id: "otro", name: "Otra tienda" },
];

export const OFFER_STORES = STORES.filter(
  (store): store is { id: "walmart" | "aurrera" | "soriana" | "chedraui"; name: string } =>
    store.id === "walmart" || store.id === "aurrera" || store.id === "soriana" || store.id === "chedraui",
);

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: "abarrotes", name: "Abarrotes" },
  { id: "lacteos", name: "Lácteos" },
  { id: "proteinas", name: "Huevo y carnes" },
  { id: "frutas-verduras", name: "Frutas y verduras" },
  { id: "tortilla-pan", name: "Tortilla y pan" },
  { id: "aceites", name: "Aceites" },
  { id: "otros", name: "Otros alimentos" },
];

export const UNITS: { id: Unit; name: string }[] = [
  { id: "kg", name: "kg" },
  { id: "g", name: "g" },
  { id: "L", name: "L" },
  { id: "ml", name: "ml" },
  { id: "pza", name: "pza" },
  { id: "paquete", name: "paquete" },
];

export const TIMEZONES: { id: string; label: string }[] = [
  { id: "America/Mexico_City", label: "Centro (Ciudad de México)" },
  { id: "America/Monterrey", label: "Centro (Monterrey)" },
  { id: "America/Cancun", label: "Sureste (Cancún)" },
  { id: "America/Chihuahua", label: "Montaña (Chihuahua)" },
  { id: "America/Mazatlan", label: "Pacífico (Mazatlán)" },
  { id: "America/Hermosillo", label: "Pacífico (Hermosillo)" },
  { id: "America/Tijuana", label: "Noroeste (Tijuana)" },
];

export const STAPLES: Product[] = [
  { id: "leche", name: "Leche", category: "lacteos", defaultUnit: "L", staple: true },
  { id: "arroz", name: "Arroz", category: "abarrotes", defaultUnit: "kg", staple: true },
  { id: "huevo", name: "Huevo", category: "proteinas", defaultUnit: "paquete", staple: true },
  { id: "pollo", name: "Pollo", category: "proteinas", defaultUnit: "kg", staple: true },
  { id: "res", name: "Carne de res", category: "proteinas", defaultUnit: "kg", staple: true },
  { id: "frijol", name: "Frijol", category: "abarrotes", defaultUnit: "kg", staple: true },
  { id: "aceite", name: "Aceite", category: "aceites", defaultUnit: "L", staple: true },
  { id: "tortilla", name: "Tortilla de maíz", category: "tortilla-pan", defaultUnit: "kg", staple: true },
  { id: "platano", name: "Plátano", category: "frutas-verduras", defaultUnit: "kg", staple: true },
  { id: "jitomate", name: "Jitomate", category: "frutas-verduras", defaultUnit: "kg", staple: true },
  { id: "cebolla", name: "Cebolla", category: "frutas-verduras", defaultUnit: "kg", staple: true },
  { id: "limon", name: "Limón", category: "frutas-verduras", defaultUnit: "kg", staple: true },
  { id: "manzana", name: "Manzana", category: "frutas-verduras", defaultUnit: "kg", staple: true },
  { id: "papa", name: "Papa", category: "frutas-verduras", defaultUnit: "kg", staple: true },
];

export const HABITS: Habit[] = [
  { id: "fruta", name: "Fruta o verdura", hint: "En alguna comida del día" },
  { id: "agua", name: "Agua", hint: "Varios vasos a lo largo del día" },
  { id: "casa", name: "Comida en casa", hint: "Al menos una comida preparada en casa" },
];

export function storeName(id: string): string {
  return STORES.find((store) => store.id === id)?.name ?? "Tienda";
}

export function categoryName(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.name ?? "Alimentos";
}

export function isStoreId(value: string): value is StoreId {
  return STORES.some((store) => store.id === value);
}

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

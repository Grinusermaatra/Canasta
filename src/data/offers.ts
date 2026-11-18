import { addDays } from "../domain/dates";
import type { Offer } from "../domain/types";

/**
 * INTEGRACIÓN: catálogo local y ficticio.
 * No consulta Walmart, Bodega Aurrera, Soriana ni Chedraui.
 * No hay URL de compra ni precios vigentes.
 * Una fuente real reemplazaría `buildOffers` y conservaría la marca `example`.
 */
interface OfferSeed {
  id: string;
  productId: string;
  productName: string;
  storeId: Offer["storeId"];
  price: number;
  regularPrice: number;
  unit: string;
  from: number;
  until: number;
}

const SEEDS: OfferSeed[] = [
  { id: "oferta-leche-walmart", productId: "leche", productName: "Leche", storeId: "walmart", price: 26.5, regularPrice: 32, unit: "L", from: -2, until: 6 },
  { id: "oferta-leche-aurrera", productId: "leche", productName: "Leche", storeId: "aurrera", price: 24.9, regularPrice: 30, unit: "L", from: -1, until: 8 },
  { id: "oferta-leche-soriana", productId: "leche", productName: "Leche", storeId: "soriana", price: 27, regularPrice: 31.5, unit: "L", from: -3, until: 5 },
  { id: "oferta-arroz-chedraui", productId: "arroz", productName: "Arroz", storeId: "chedraui", price: 29, regularPrice: 38, unit: "kg", from: -2, until: 9 },
  { id: "oferta-arroz-aurrera", productId: "arroz", productName: "Arroz", storeId: "aurrera", price: 27.5, regularPrice: 36, unit: "kg", from: -1, until: 7 },
  { id: "oferta-huevo-walmart", productId: "huevo", productName: "Huevo", storeId: "walmart", price: 54, regularPrice: 68, unit: "paquete", from: -2, until: 4 },
  { id: "oferta-huevo-aurrera", productId: "huevo", productName: "Huevo", storeId: "aurrera", price: 49.9, regularPrice: 64, unit: "paquete", from: 0, until: 10 },
  { id: "oferta-pollo-soriana", productId: "pollo", productName: "Pollo", storeId: "soriana", price: 89, regularPrice: 109, unit: "kg", from: -1, until: 5 },
  { id: "oferta-pollo-chedraui", productId: "pollo", productName: "Pollo", storeId: "chedraui", price: 92, regularPrice: 112, unit: "kg", from: -2, until: 6 },
  { id: "oferta-frijol-aurrera", productId: "frijol", productName: "Frijol", storeId: "aurrera", price: 34, regularPrice: 44, unit: "kg", from: -4, until: 8 },
  { id: "oferta-aceite-walmart", productId: "aceite", productName: "Aceite", storeId: "walmart", price: 52, regularPrice: 67, unit: "L", from: -1, until: 12 },
  { id: "oferta-tortilla-aurrera", productId: "tortilla", productName: "Tortilla de maíz", storeId: "aurrera", price: 21.5, regularPrice: 26, unit: "kg", from: 0, until: 3 },
  { id: "oferta-jitomate-soriana", productId: "jitomate", productName: "Jitomate", storeId: "soriana", price: 28, regularPrice: 39, unit: "kg", from: -1, until: 4 },
  { id: "oferta-manzana-chedraui", productId: "manzana", productName: "Manzana", storeId: "chedraui", price: 42, regularPrice: 58, unit: "kg", from: -2, until: 7 },
  { id: "oferta-res-walmart", productId: "res", productName: "Carne de res", storeId: "walmart", price: 169, regularPrice: 199, unit: "kg", from: -10, until: -1 },
  { id: "oferta-limon-aurrera", productId: "limon", productName: "Limón", storeId: "aurrera", price: 29, regularPrice: 42, unit: "kg", from: -1, until: 5 },
];

export function buildOffers(today: string): Offer[] {
  return SEEDS.map((seed) => ({
    id: seed.id,
    productId: seed.productId,
    productName: seed.productName,
    storeId: seed.storeId,
    price: seed.price,
    regularPrice: seed.regularPrice,
    unit: seed.unit,
    validFrom: addDays(today, seed.from),
    validUntil: addDays(today, seed.until),
    example: true as const,
  }));
}

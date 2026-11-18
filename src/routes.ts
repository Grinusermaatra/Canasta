import type { IconName } from "./components/Icons";

export const ROUTES = [
  { id: "inicio", href: "#/", label: "Inicio", icon: "home", primary: true, lede: "Así va tu gasto en comida, tus hábitos y tus metas." },
  { id: "gastos", href: "#/gastos", label: "Gastos", icon: "receipt", primary: true, lede: "Compras de comida y despensa que tú registras." },
  { id: "canasta", href: "#/canasta", label: "Canasta", icon: "basket", primary: true, lede: "Precios que sí pagaste en los productos de todos los días." },
  { id: "habitos", href: "#/habitos", label: "Hábitos", icon: "leaf", primary: true, lede: "Un registro simple, a tu ritmo. Nada de esto es un diagnóstico." },
  { id: "retos", href: "#/retos", label: "Retos", icon: "flag", primary: true, lede: "Metas concretas de gasto y de hábitos, con un avance visible." },
  { id: "ofertas", href: "#/ofertas", label: "Ofertas", icon: "tag", primary: false, lede: "Un catálogo ficticio para practicar la búsqueda por tienda y producto." },
  { id: "ajustes", href: "#/ajustes", label: "Ajustes", icon: "settings", primary: false, lede: "Presupuesto, recordatorios y los datos de este navegador." },
] as const;

export type RouteId = (typeof ROUTES)[number]["id"];

export function parseRoute(hash: string): { route: RouteId; nueva: boolean } {
  const raw = hash.replace(/^#/, "");
  const [pathPart = "", queryPart = ""] = raw.split("?");
  const path = pathPart.replace(/^\//, "");
  const match = ROUTES.find((route) => (route.id === "inicio" ? path === "" || path === "inicio" : path === route.id));
  const route: RouteId = match?.id ?? "inicio";
  const params = new URLSearchParams(queryPart);
  return { route, nueva: params.get("nueva") === "1" && route === "gastos" };
}

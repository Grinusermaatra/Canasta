import { useEffect, useState } from "react";
import { Icon, Logo } from "./Icons";
import { LiveStatus } from "./ui";
import { ExpensesView } from "../views/ExpensesView";
import { HomeView } from "../views/HomeView";
import { BasketView } from "../views/BasketView";
import { HabitsView } from "../views/HabitsView";
import { ChallengesView } from "../views/ChallengesView";
import { OffersView } from "../views/OffersView";
import { SettingsView } from "../views/SettingsView";
import { greeting } from "../domain/dates";
import { ROUTES, parseRoute, type RouteId } from "../routes";
import { useCanasta } from "../state/CanastaContext";

export function Shell() {
  const { data, now, persistError, toast } = useCanasta();
  const [route, setRoute] = useState<RouteId>("inicio");
  const [createToken, setCreateToken] = useState(0);

  useEffect(() => {
    const sync = () => {
      const parsed = parseRoute(window.location.hash);
      setRoute(parsed.route);
      if (parsed.nueva) {
        setCreateToken((value) => value + 1);
        window.history.replaceState(null, "", "#/gastos");
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const current = ROUTES.find((item) => item.id === route) ?? ROUTES[0];
  const title = route === "inicio" ? greeting(now, data.settings.timezone) : current.label;

  useEffect(() => {
    document.title = route === "inicio" ? "Canasta" : `${current.label} · Canasta`;
  }, [route, current.label]);

  return (
    <div className="app">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      {data.settings.demoMode ? (
        <p className="demo-banner" role="status">
          Modo demostración · los cambios se guardan solo en este navegador · las ofertas son de ejemplo
        </p>
      ) : null}
      {persistError ? (
        <p className="persist-banner" role="alert">
          No pudimos guardar en este navegador. Los cambios duran solo mientras la pestaña siga abierta.
        </p>
      ) : null}
      <div className="frame">
        <aside className="sidebar">
          <a className="brand" href="#/">
            <Logo />
          </a>
          <nav aria-label="Secciones">
            {ROUTES.map((item) => (
              <a key={item.id} href={item.href} aria-current={route === item.id ? "page" : undefined}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <p className="side-note">Prototipo local. Sin cuenta y sin conexión a tiendas.</p>
        </aside>
        <div className="main-col">
          <header className="topbar">
            <div>
              <p className="eyebrow">Canasta</p>
              <h1>{title}</h1>
              <p className="lede">{current.lede}</p>
            </div>
            <div className="mobile-links">
              <a className="icon-link" href="#/ofertas" aria-label="Ofertas" aria-current={route === "ofertas" ? "page" : undefined}>
                <Icon name="tag" />
              </a>
              <a className="icon-link" href="#/ajustes" aria-label="Ajustes" aria-current={route === "ajustes" ? "page" : undefined}>
                <Icon name="settings" />
              </a>
            </div>
          </header>
          <main id="contenido" className="content stack">
            {route === "inicio" && <HomeView />}
            {route === "gastos" && <ExpensesView createToken={createToken} />}
            {route === "canasta" && <BasketView />}
            {route === "habitos" && <HabitsView />}
            {route === "retos" && <ChallengesView />}
            {route === "ofertas" && <OffersView />}
            {route === "ajustes" && <SettingsView />}
          </main>
        </div>
      </div>
      <nav className="tabbar" aria-label="Secciones principales">
        {ROUTES.filter((item) => item.primary).map((item) => (
          <a key={item.id} href={item.href} aria-current={route === item.id ? "page" : undefined}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <LiveStatus message={toast} />
    </div>
  );
}

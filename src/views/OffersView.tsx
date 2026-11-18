import { useMemo, useState } from "react";
import { EmptyState, ExampleNote } from "../components/ui";
import { filterOffers, offerSavings, offerTiming, type OfferStoreFilter } from "../domain/calculations";
import { OFFER_STORES, storeName } from "../domain/constants";
import { formatDayMonth } from "../domain/dates";
import { formatMXN } from "../domain/money";
import { useCanasta } from "../state/CanastaContext";

export function OffersView() {
  const { offers, today } = useCanasta();
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<OfferStoreFilter>("todas");
  const results = useMemo(() => filterOffers(offers, query, store, today), [offers, query, store, today]);

  return (
    <div className="stack">
      <ExampleNote>
        Datos de ejemplo. No son precios vigentes de Walmart, Bodega Aurrera, Soriana ni Chedraui, y no hay enlace para comprar.
      </ExampleNote>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="field grow">
          <label htmlFor="buscar-oferta">Buscar producto</label>
          <input
            id="buscar-oferta"
            type="search"
            value={query}
            placeholder="Leche, arroz, huevo…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </form>
      <div className="chips" role="group" aria-label="Filtrar por tienda">
        <button type="button" className={store === "todas" ? "chip on" : "chip"} aria-pressed={store === "todas"} onClick={() => setStore("todas")}>
          Todas
        </button>
        {OFFER_STORES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={store === item.id ? "chip on" : "chip"}
            aria-pressed={store === item.id}
            onClick={() => setStore(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="muted">
        {results.length === 0
          ? "Prueba con otro nombre o con otra tienda."
          : `${results.length} ${results.length === 1 ? "resultado de ejemplo" : "resultados de ejemplo"}`}
      </p>
      {results.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          body="Prueba con leche, arroz o huevo, o quita el filtro de tienda. El catálogo es local y de ejemplo."
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery("");
              setStore("todas");
            }}
          >
            Limpiar búsqueda
          </button>
        </EmptyState>
      ) : (
        <ul className="card-list">
          {results.map((offer) => {
            const timing = offerTiming(offer, today);
            const savings = offerSavings(offer);
            return (
              <li key={offer.id}>
                <article className="card offer-card">
                  <div className="section-head">
                    <h2>{offer.productName}</h2>
                    <span className="pill example">Ejemplo</span>
                  </div>
                  <p className="muted">{storeName(offer.storeId)}</p>
                  <p className="stat-value">
                    {formatMXN(offer.price)} <span className="unit">/ {offer.unit}</span>
                  </p>
                  <p>Precio de referencia del ejemplo: {formatMXN(offer.regularPrice)}</p>
                  <p>Ahorro estimado: {formatMXN(savings)}</p>
                  <p className="muted">
                    Vigencia de ejemplo: {formatDayMonth(offer.validFrom)} a {formatDayMonth(offer.validUntil)}
                  </p>
                  {timing === "expired" ? <p>Fuera de vigencia en este ejemplo.</p> : null}
                  {timing === "upcoming" ? <p>Todavía no empieza en este ejemplo.</p> : null}
                  <p className="hint">Sin enlace de compra. Esta ficha solo sirve para probar el buscador.</p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

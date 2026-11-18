import { useState, type FormEvent } from "react";
import { Sparkline } from "../components/Charts";
import { ConfirmDialog, EmptyState, ExampleNote, Field, Sheet } from "../components/ui";
import { offerSavings, offerTiming, orderedProducts, pricePoints } from "../domain/calculations";
import { CATEGORIES, STORES, UNITS, categoryName, storeName } from "../domain/constants";
import { formatLongDate } from "../domain/dates";
import { blankBasketDraft, hasErrors, validateBasket, type BasketDraft, type BasketErrors } from "../domain/forms";
import { formatMXN, money, parseAmount } from "../domain/money";
import type { CategoryId, Product, StoreId, Unit } from "../domain/types";
import { useCanasta } from "../state/CanastaContext";

export function BasketView() {
  const { data, today, offers, addBasketPurchase, removeCustomProduct, notify } = useCanasta();
  const [category, setCategory] = useState("todas");
  const [draft, setDraft] = useState<BasketDraft | null>(null);
  const [errors, setErrors] = useState<BasketErrors>({});
  const [pendingRemove, setPendingRemove] = useState<Product | null>(null);
  const products = orderedProducts(data.products).filter((product) => category === "todas" || product.category === category);

  const openFor = (productId: string) => {
    setErrors({});
    if (productId === "otro") {
      setDraft({ ...blankBasketDraft(today), productId: "otro", unit: "kg" });
      return;
    }
    const product = data.products.find((item) => item.id === productId);
    setDraft(blankBasketDraft(today, product));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const nextErrors = validateBasket(draft, today, data.products);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    const selected = data.products.find((product) => product.id === draft.productId);
    const quantity = parseAmount(draft.quantity) ?? 0;
    const unitPrice = money(parseAmount(draft.unitPrice) ?? 0);
    addBasketPurchase({
      productId: draft.productId === "otro" ? null : draft.productId,
      name: draft.productId === "otro" ? draft.name.trim() : (selected?.name ?? draft.name),
      category: draft.productId === "otro" ? (draft.category as CategoryId) : (selected?.category ?? "otros"),
      unit: draft.unit,
      date: draft.date,
      storeId: draft.storeId as StoreId,
      quantity,
      unitPrice,
    });
    notify("Compra agregada a la canasta y a tus gastos.");
    setDraft(null);
  };

  return (
    <div className="stack">
      <ExampleNote>
        La evolución sale de lo que registraste aquí. No es un precio de mercado ni una cotización de tienda.
      </ExampleNote>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => openFor("otro")}>
          Agregar producto comprado
        </button>
      </div>
      <div className="chips" role="group" aria-label="Filtrar por categoría">
        <button type="button" className={category === "todas" ? "chip on" : "chip"} aria-pressed={category === "todas"} onClick={() => setCategory("todas")}>
          Todas
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={category === item.id ? "chip on" : "chip"}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      {products.length === 0 ? (
        <EmptyState title="Sin productos en esta categoría" body="Prueba con otra categoría o agrega uno que hayas comprado." />
      ) : (
        <ul className="product-grid">
          {products.map((product) => {
            const points = pricePoints(data.expenses, product.id);
            const latest = points.at(-1);
            const sameUnit = latest ? points.filter((point) => point.unit === latest.unit) : [];
            const values = sameUnit.map((point) => point.unitPrice);
            const previous = sameUnit.length > 1 ? sameUnit[sameUnit.length - 2] : undefined;
            const related = offers.filter((offer) => offer.productId === product.id && offerTiming(offer, today) === "current");
            const cheapest = [...related].sort((a, b) => a.price - b.price)[0];
            const used = data.expenses.some((expense) => expense.items.some((item) => item.productId === product.id));
            const delta = latest && previous ? latest.unitPrice - previous.unitPrice : null;
            return (
              <li key={product.id}>
                <article className="card product-card">
                  <p className="eyebrow">{categoryName(product.category)}</p>
                  <h2>{product.name}</h2>
                  {latest ? (
                    <>
                      <p className="stat-value">{formatMXN(latest.unitPrice)}</p>
                      <p className="muted">
                        por {latest.unit} · {storeName(latest.storeId)} · {formatLongDate(latest.date)}
                      </p>
                      <Sparkline
                        values={values}
                        label={`Evolución del precio de ${product.name}: ${values.map((value) => formatMXN(value)).join(", ")}`}
                      />
                      <p>
                        {sameUnit.length < 2
                          ? "Solo hay un precio registrado en esta unidad."
                          : delta === null
                            ? "Evolución según tus registros."
                            : delta > 0
                              ? `Subió ${formatMXN(delta)} respecto a la compra anterior.`
                              : delta < 0
                                ? `Bajó ${formatMXN(Math.abs(delta))} respecto a la compra anterior.`
                                : "Igual que la compra anterior."}
                      </p>
                      {points.length > sameUnit.length ? (
                        <p className="hint">Hay compras en otra unidad y no las mezclamos en la gráfica.</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="muted">Sin compras registradas. Cuando agregues una, aquí verás el precio que pagaste.</p>
                  )}
                  {cheapest ? (
                    <p className="hint">
                      En ofertas de ejemplo, desde {formatMXN(cheapest.price)} / {cheapest.unit} en {storeName(cheapest.storeId)}. Ahorro estimado del ejemplo:{" "}
                      {formatMXN(offerSavings(cheapest))}. No es un precio vigente.
                    </p>
                  ) : null}
                  <div className="row-actions">
                    <button type="button" className="btn btn-primary btn-small" onClick={() => openFor(product.id)}>
                      Registrar compra
                    </button>
                    {!product.staple && !used ? (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setPendingRemove(product)}>
                        Quitar de la lista
                      </button>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {draft ? (
        <Sheet title="Registrar en la canasta" onClose={() => setDraft(null)}>
          <form className="stack" onSubmit={onSubmit} noValidate>
            {errors.form ? (
              <p className="form-alert" role="alert">
                {errors.form}
              </p>
            ) : null}
            <Field id="producto" label="Producto">
              {(props) => (
                <select
                  {...props}
                  value={draft.productId}
                  autoFocus
                  onChange={(event) => {
                    const productId = event.target.value;
                    const product = data.products.find((item) => item.id === productId);
                    setDraft({ ...draft, productId, unit: product?.defaultUnit ?? draft.unit });
                  }}
                >
                  {orderedProducts(data.products).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                  <option value="otro">Otro producto</option>
                </select>
              )}
            </Field>
            {draft.productId === "otro" ? (
              <>
                <Field id="nombre-producto" label="Nombre" error={errors.name}>
                  {(props) => <input {...props} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />}
                </Field>
                <Field id="categoria-producto" label="Categoría" error={errors.category}>
                  {(props) => (
                    <select {...props} value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as CategoryId | "" })}>
                      <option value="">Elige una categoría</option>
                      {CATEGORIES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </>
            ) : null}
            <Field id="fecha-canasta" label="Fecha" error={errors.date}>
              {(props) => <input {...props} type="date" max={today} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />}
            </Field>
            <Field id="tienda-canasta" label="Tienda" error={errors.storeId}>
              {(props) => (
                <select {...props} value={draft.storeId} onChange={(event) => setDraft({ ...draft, storeId: event.target.value })}>
                  <option value="">Elige una tienda</option>
                  {STORES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id="cantidad-canasta" label="Cantidad" error={errors.quantity}>
              {(props) => (
                <input {...props} inputMode="decimal" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} />
              )}
            </Field>
            <Field id="unidad-canasta" label="Unidad">
              {(props) => (
                <select {...props} value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value as Unit })}>
                  {UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id="precio-canasta" label="Precio que pagaste por unidad" error={errors.unitPrice}>
              {(props) => (
                <input
                  {...props}
                  inputMode="decimal"
                  placeholder="28.50"
                  value={draft.unitPrice}
                  onChange={(event) => setDraft({ ...draft, unitPrice: event.target.value })}
                />
              )}
            </Field>
            <BasketPreview draft={draft} />
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar compra
              </button>
            </div>
          </form>
        </Sheet>
      ) : null}

      {pendingRemove ? (
        <ConfirmDialog
          title="Quitar producto"
          body={`¿Quitar ${pendingRemove.name} de la canasta? No borra otras cosas del navegador.`}
          confirmLabel="Quitar"
          danger
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => {
            removeCustomProduct(pendingRemove.id);
            setPendingRemove(null);
            notify("Quitamos el producto de la lista.");
          }}
        />
      ) : null}
      </div>
  );
}

function BasketPreview({ draft }: { draft: BasketDraft }) {
  const quantity = parseAmount(draft.quantity);
  const price = parseAmount(draft.unitPrice);
  const preview = quantity !== null && price !== null && quantity > 0 && price > 0 ? money(quantity * price) : null;
  return (
    <p className="hint">
      {preview !== null
        ? `Total de esta compra: ${formatMXN(preview)}. También aparecerá en Gastos.`
        : "También se anota en Gastos, para que los totales salgan del mismo registro."}
    </p>
  );
}

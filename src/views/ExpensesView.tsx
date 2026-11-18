import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, STORES, UNITS, categoryName, storeName } from "../domain/constants";
import { filterExpenses, monthOptions } from "../domain/calculations";
import {
  blankExpenseDraft,
  blankItemDraft,
  expenseToDraft,
  hasErrors,
  toExpense,
  validateExpense,
  type ExpenseDraft,
  type ExpenseErrors,
} from "../domain/forms";
import { formatDayMonth } from "../domain/dates";
import { formatMXN, formatQty, lineTotal, money, parseAmount } from "../domain/money";
import type { Expense } from "../domain/types";
import { useCanasta } from "../state/CanastaContext";
import { ConfirmDialog, EmptyState, Field, Sheet } from "../components/ui";

function draftTotal(draft: ExpenseDraft): number | null {
  if (draft.items.length === 0) return null;
  let total = 0;
  for (const item of draft.items) {
    const quantity = parseAmount(item.quantity);
    const price = parseAmount(item.unitPrice);
    if (quantity === null || price === null) return null;
    total += lineTotal(quantity, price);
  }
  return money(total);
}

export function ExpensesView({ createToken }: { createToken: number }) {
  const { data, today, saveExpense, deleteExpense, notify } = useCanasta();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [category, setCategory] = useState("todas");
  const [store, setStore] = useState("todas");
  const [session, setSession] = useState<{ mode: "create" | "edit"; draft: ExpenseDraft } | null>(null);
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (createToken === tokenRef.current) return;
    tokenRef.current = createToken;
    if (createToken < 1) return;
    setErrors({});
    setSession({ mode: "create", draft: blankExpenseDraft(today) });
  }, [createToken, today]);

  const months = useMemo(() => monthOptions(data.expenses, today), [data.expenses, today]);
  const visible = filterExpenses(data.expenses, { month, category, store });
  const total = money(visible.reduce((sum, expense) => sum + expense.amount, 0));

  const openCreate = () => {
    setErrors({});
    setSession({ mode: "create", draft: blankExpenseDraft(today) });
  };

  const updateDraft = (patch: Partial<ExpenseDraft>) => {
    setSession((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    const nextErrors = validateExpense(session.draft, today);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    saveExpense(toExpense(session.draft, data.products));
    notify(session.mode === "edit" ? "Compra actualizada." : "Compra guardada.");
    setSession(null);
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Registrar compra
        </button>
        <p className="toolbar-total">
          {visible.length} {visible.length === 1 ? "compra" : "compras"} · {formatMXN(total)}
        </p>
      </div>

      <form className="filters" aria-label="Filtros de compras">
        <div className="field">
          <label htmlFor="filtro-mes">Mes</label>
          <select id="filtro-mes" value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="todos">Todos los meses</option>
            {months.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filtro-categoria">Categoría</label>
          <select id="filtro-categoria" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="todas">Todas</option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filtro-tienda">Tienda</label>
          <select id="filtro-tienda" value={store} onChange={(event) => setStore(event.target.value)}>
            <option value="todas">Todas</option>
            {STORES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {visible.length === 0 ? (
        <EmptyState
          title={data.expenses.length === 0 ? "Todavía no registras compras" : "No hay compras con esos filtros"}
          body={
            data.expenses.length === 0
              ? "Cuando anotes un mandado, el total de inicio sale de aquí."
              : "Prueba con otro mes, otra tienda o quita los filtros."
          }
        >
          {data.expenses.length === 0 ? (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Registrar compra
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMonth("todos");
                setCategory("todas");
                setStore("todas");
              }}
            >
              Quitar filtros
            </button>
          )}
        </EmptyState>
      ) : (
        <ul className="card-list">
          {visible.map((expense) => (
            <li key={expense.id}>
              <article className="card expense">
                <div className="expense-top">
                  <div>
                    <h2>{storeName(expense.storeId)}</h2>
                    <p className="muted">
                      {formatDayMonth(expense.date)} · {categoryName(expense.category)}
                    </p>
                  </div>
                  <p className="expense-amount">{formatMXN(expense.amount)}</p>
                </div>
                {expense.note ? <p>{expense.note}</p> : null}
                {expense.items.length > 0 ? (
                  <ul className="items">
                    {expense.items.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        <span>
                          {formatQty(item.quantity, item.unit)} · {formatMXN(lineTotal(item.quantity, item.unitPrice))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Sin desglose de artículos</p>
                )}
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      setErrors({});
                      setSession({ mode: "edit", draft: expenseToDraft(expense) });
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="btn btn-danger btn-small" onClick={() => setPendingDelete(expense)}>
                    Eliminar
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <Sheet title={session.mode === "edit" ? "Editar compra" : "Registrar compra"} onClose={() => setSession(null)}>
          <form className="stack" onSubmit={onSubmit} noValidate>
            {(errors.form || hasErrors(errors)) ? (
              <p className="form-alert" role="alert">
                {errors.form ?? "Revisa los campos marcados para guardar la compra."}
              </p>
            ) : null}
            <Field id="fecha" label="Fecha" error={errors.date}>
              {(props) => (
                <input
                  {...props}
                  type="date"
                  max={today}
                  value={session.draft.date}
                  onChange={(event) => updateDraft({ date: event.target.value })}
                  autoFocus
                />
              )}
            </Field>
            <Field id="tienda" label="Tienda" error={errors.storeId}>
              {(props) => (
                <select {...props} value={session.draft.storeId} onChange={(event) => updateDraft({ storeId: event.target.value })}>
                  <option value="">Elige una tienda</option>
                  {STORES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id="categoria" label="Categoría" error={errors.category}>
              {(props) => (
                <select {...props} value={session.draft.category} onChange={(event) => updateDraft({ category: event.target.value })}>
                  <option value="">Elige una categoría</option>
                  {CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            {session.draft.items.length === 0 ? (
              <Field id="importe" label="Importe" hint="Puedes anotar solo el total del ticket." error={errors.amount}>
                {(props) => (
                  <input
                    {...props}
                    inputMode="decimal"
                    value={session.draft.amount}
                    onChange={(event) => updateDraft({ amount: event.target.value })}
                    placeholder="186.50"
                  />
                )}
              </Field>
            ) : (
              <div className="field">
                <span id="importe-label">Importe</span>
                <p className="amount-readout" aria-labelledby="importe-label">
                  {draftTotal(session.draft) === null ? "Completa los artículos" : formatMXN(draftTotal(session.draft) ?? 0)}
                </p>
                <p className="hint">Sale del desglose. Si quitas los artículos, puedes capturar el total del ticket.</p>
              </div>
            )}
            <Field id="nota" label="Nota" hint="Opcional. Hasta 160 caracteres." error={errors.note}>
              {(props) => (
                <textarea
                  {...props}
                  maxLength={160}
                  value={session.draft.note}
                  onChange={(event) => updateDraft({ note: event.target.value })}
                />
              )}
            </Field>

            <fieldset className="stack-sm">
              <legend>Desglose de artículos (opcional)</legend>
              {session.draft.items.map((item, index) => {
                const rowErrors = errors.items?.[item.id];
                return (
                  <div className="item-row" key={item.id}>
                    <Field id={`articulo-${item.id}`} label={`Artículo ${index + 1}`} error={rowErrors?.name}>
                      {(props) => (
                        <>
                          <input
                            {...props}
                            list="productos-sugeridos"
                            value={item.name}
                            onChange={(event) =>
                              updateDraft({
                                items: session.draft.items.map((row) => (row.id === item.id ? { ...row, name: event.target.value } : row)),
                              })
                            }
                          />
                        </>
                      )}
                    </Field>
                    <Field id={`cantidad-${item.id}`} label="Cantidad" error={rowErrors?.quantity}>
                      {(props) => (
                        <input
                          {...props}
                          inputMode="decimal"
                          value={item.quantity}
                          onChange={(event) =>
                            updateDraft({
                              items: session.draft.items.map((row) => (row.id === item.id ? { ...row, quantity: event.target.value } : row)),
                            })
                          }
                        />
                      )}
                    </Field>
                    <Field id={`unidad-${item.id}`} label="Unidad">
                      {(props) => (
                        <select
                          {...props}
                          value={item.unit}
                          onChange={(event) =>
                            updateDraft({
                              items: session.draft.items.map((row) =>
                                row.id === item.id ? { ...row, unit: event.target.value as ExpenseDraft["items"][number]["unit"] } : row,
                              ),
                            })
                          }
                        >
                          {UNITS.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    <Field id={`precio-${item.id}`} label="Precio unitario" error={rowErrors?.unitPrice}>
                      {(props) => (
                        <input
                          {...props}
                          inputMode="decimal"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateDraft({
                              items: session.draft.items.map((row) => (row.id === item.id ? { ...row, unitPrice: event.target.value } : row)),
                            })
                          }
                        />
                      )}
                    </Field>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => updateDraft({ items: session.draft.items.filter((row) => row.id !== item.id) })}
                    >
                      Quitar artículo
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => updateDraft({ items: [...session.draft.items, blankItemDraft()] })}
              >
                Agregar artículo
              </button>
            </fieldset>
            <datalist id="productos-sugeridos">
              {data.products.map((product) => (
                <option key={product.id} value={product.name} />
              ))}
            </datalist>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSession(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar compra
              </button>
            </div>
          </form>
        </Sheet>
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar compra"
          body={`¿Eliminar la compra de ${formatMXN(pendingDelete.amount)} en ${storeName(pendingDelete.storeId)}? Solo se borra de Canasta en este navegador.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteExpense(pendingDelete.id);
            setPendingDelete(null);
            notify("Compra eliminada.");
          }}
        />
      ) : null}
    </div>
  );
}

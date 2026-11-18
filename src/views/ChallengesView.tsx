import { useState, type FormEvent } from "react";
import { ConfirmDialog, EmptyState, Field, ProgressBar, Sheet } from "../components/ui";
import { challengeProgress } from "../domain/calculations";
import { HABITS } from "../domain/constants";
import {
  blankChallengeDraft,
  challengeToDraft,
  hasErrors,
  toChallenge,
  validateChallenge,
  type ChallengeDraft,
  type ChallengeErrors,
} from "../domain/forms";
import type { Challenge, ChallengeKind, ChallengeStatus } from "../domain/types";
import { buildPreset, type PresetId } from "../data/presets";
import { useCanasta } from "../state/CanastaContext";

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "preset-spend", label: "Gasto semanal debajo de $1,200" },
  { id: "preset-prices", label: "Comparar precios antes de comprar" },
  { id: "preset-fruit", label: "Fruta o verdura 5 días" },
];

const KIND_LABEL: Record<ChallengeKind, string> = {
  weekly_spend_cap: "Tope de gasto semanal",
  habit_days: "Días con un hábito",
  price_checks: "Comparar precios",
  custom_count: "Conteo libre",
};

export function ChallengesView() {
  const { data, today, saveChallenge, deleteChallenge, setChallengeStatus, toggleChallengeLog, notify } = useCanasta();
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  const [errors, setErrors] = useState<ChallengeErrors>({});
  const [pendingDelete, setPendingDelete] = useState<Challenge | null>(null);
  const editing = Boolean(draft?.id);

  const openCreate = () => {
    setErrors({});
    setDraft(blankChallengeDraft(today));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const nextErrors = validateChallenge(draft);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    const challenge = toChallenge(draft, today);
    const wasEdit = Boolean(draft.id);
    saveChallenge(challenge);
    setDraft(null);
    notify(wasEdit ? "Reto actualizado." : "Reto guardado.");
  };

  return (
    <div className="stack">
      <section className="card">
        <h2>Elegir un reto</h2>
        <p className="muted">Son ejemplos para empezar. La recompensa es simbólica y no tiene valor de dinero.</p>
        <div className="preset-list">
          {PRESETS.map((preset) => {
            const exists = data.challenges.some((challenge) => challenge.id === preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                className="btn btn-ghost"
                disabled={exists}
                onClick={() => {
                  saveChallenge(buildPreset(preset.id, today));
                  notify("Reto agregado.");
                }}
              >
                {exists ? `${preset.label} · ya está en tus retos` : preset.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Crear otro reto
        </button>
      </section>

      {data.challenges.length === 0 ? (
        <EmptyState title="Sin retos por ahora" body="Elige uno de los ejemplos o crea el tuyo. El avance se calcula con tus compras y hábitos." />
      ) : (
        <ul className="card-list">
          {data.challenges.map((challenge) => {
            const progress = challengeProgress(challenge, data.expenses, data.checkIns, today);
            const loggedToday = challenge.checkDates.includes(today);
            const manual = challenge.kind === "price_checks" || challenge.kind === "custom_count";
            return (
              <li key={challenge.id}>
                <article className="card challenge">
                  <div className="section-head">
                    <h2>{challenge.title}</h2>
                    <span className={`pill ${progress.tone}`}>{progress.statusLabel}</span>
                  </div>
                  <p className="eyebrow">{KIND_LABEL[challenge.kind]}</p>
                  {challenge.description ? <p>{challenge.description}</p> : null}
                  <p>{progress.detail}</p>
                  <ProgressBar ratio={progress.ratio} tone={progress.tone} label={progress.detail} />
                  <p className="reward">
                    <span>Recompensa simbólica.</span> {challenge.reward}
                  </p>
                  <div className="row-actions">
                    {manual && challenge.status === "active" ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-small"
                        onClick={() => {
                          toggleChallengeLog(challenge.id, today);
                          notify(loggedToday ? "Quitamos el registro de hoy." : "Quedó registrado hoy.");
                        }}
                      >
                        {loggedToday ? "Quitar el de hoy" : challenge.kind === "price_checks" ? "Comparé precios hoy" : "Registrar avance de hoy"}
                      </button>
                    ) : null}
                    {challenge.kind === "habit_days" ? (
                      <a className="btn btn-ghost btn-small" href="#/habitos">
                        Ir a hábitos
                      </a>
                    ) : null}
                    {challenge.status !== "completed" ? (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setChallengeStatus(challenge.id, "completed")}>
                        Marcar como cumplido
                      </button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setChallengeStatus(challenge.id, "active")}>
                        Volver a activar
                      </button>
                    )}
                    {challenge.status === "paused" ? (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setChallengeStatus(challenge.id, "active")}>
                        Reanudar
                      </button>
                    ) : challenge.status === "active" ? (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setChallengeStatus(challenge.id, "paused")}>
                        Pausar
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => {
                        setErrors({});
                        setDraft(challengeToDraft(challenge));
                      }}
                    >
                      Editar
                    </button>
                    <button type="button" className="btn btn-danger btn-small" onClick={() => setPendingDelete(challenge)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {draft ? (
        <Sheet title={editing ? "Editar reto" : "Nuevo reto"} onClose={() => setDraft(null)}>
          <form className="stack" onSubmit={onSubmit} noValidate>
            {hasErrors(errors) ? (
              <p className="form-alert" role="alert">
                Revisa los campos marcados para guardar el reto.
              </p>
            ) : null}
            <Field id="titulo-reto" label="Título" error={errors.title}>
              {(props) => (
                <input {...props} value={draft.title} autoFocus onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              )}
            </Field>
            <Field id="descripcion-reto" label="Descripción" hint="Opcional." error={errors.description}>
              {(props) => (
                <textarea
                  {...props}
                  maxLength={240}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              )}
            </Field>
            <Field id="tipo-reto" label="Tipo">
              {(props) => (
                <select
                  {...props}
                  value={draft.kind}
                  disabled={editing}
                  onChange={(event) => setDraft({ ...draft, kind: event.target.value as ChallengeKind })}
                >
                  {Object.entries(KIND_LABEL).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            {editing ? <p className="hint">El tipo se queda fijo para no mezclar el avance que ya llevas.</p> : null}
            <Field
              id="meta-reto"
              label={draft.kind === "weekly_spend_cap" ? "Tope semanal en pesos" : "¿Cuántas veces?"}
              error={errors.target}
            >
              {(props) => (
                <input {...props} inputMode="decimal" value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} />
              )}
            </Field>
            {draft.kind === "habit_days" ? (
              <Field id="habito-reto" label="Hábito" error={errors.habitId}>
                {(props) => (
                  <select {...props} value={draft.habitId} onChange={(event) => setDraft({ ...draft, habitId: event.target.value })}>
                    {HABITS.map((habit) => (
                      <option key={habit.id} value={habit.id}>
                        {habit.name}
                      </option>
                    ))}
                    {data.habits
                      .filter((habit) => !HABITS.some((item) => item.id === habit.id))
                      .map((habit) => (
                        <option key={habit.id} value={habit.id}>
                          {habit.name}
                        </option>
                      ))}
                  </select>
                )}
              </Field>
            ) : null}
            {draft.kind !== "weekly_spend_cap" ? (
              <>
                <Field id="inicio-reto" label="Inicio" error={errors.startDate}>
                  {(props) => (
                    <input {...props} type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} />
                  )}
                </Field>
                <Field id="fin-reto" label="Fin" error={errors.endDate}>
                  {(props) => (
                    <input {...props} type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} />
                  )}
                </Field>
              </>
            ) : (
              <p className="hint">Este tipo se reinicia solo cada semana, de lunes a domingo.</p>
            )}
            <Field id="recompensa-reto" label="Recompensa simbólica" hint="Una frase, no un premio canjeable." error={errors.reward}>
              {(props) => <input {...props} value={draft.reward} onChange={(event) => setDraft({ ...draft, reward: event.target.value })} />}
            </Field>
            <Field id="estado-reto" label="Estado">
              {(props) => (
                <select {...props} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ChallengeStatus })}>
                  <option value="active">En curso</option>
                  <option value="paused">En pausa</option>
                  <option value="completed">Cumplido</option>
                </select>
              )}
            </Field>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar reto
              </button>
            </div>
          </form>
        </Sheet>
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar reto"
          body={`¿Eliminar “${pendingDelete.title}”? Puedes volver a elegir los ejemplos después.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteChallenge(pendingDelete.id);
            setPendingDelete(null);
            notify("Reto eliminado.");
          }}
        />
      ) : null}
    </div>
  );
}

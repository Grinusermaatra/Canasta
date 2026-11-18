import { useEffect, useState, type FormEvent } from "react";
import { ConfirmDialog } from "../components/ui";
import { TIMEZONES } from "../domain/constants";
import { weekdayLong } from "../domain/dates";
import { money, parseAmount } from "../domain/money";
import type { Reminder, Settings } from "../domain/types";
import { buildExpensesCsv, buildExportJson, buildHabitsCsv, downloadText } from "../persistence/export";
import { useCanasta } from "../state/CanastaContext";

interface SettingsDraft {
  monthly: string;
  weekly: string;
  timezone: string;
  demoMode: boolean;
  reminders: Reminder[];
}

function snapshot(settings: Settings, reminders: Reminder[]): SettingsDraft {
  return {
    monthly: String(settings.monthlyBudget),
    weekly: String(settings.weeklyBudget),
    timezone: settings.timezone,
    demoMode: settings.demoMode,
    reminders: reminders.map((reminder) => ({ ...reminder })),
  };
}

export function SettingsView() {
  const { data, saveSettings, restoreDemo, notify } = useCanasta();
  const [draft, setDraft] = useState<SettingsDraft>(() => snapshot(data.settings, data.reminders));
  const [error, setError] = useState("");
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    setDraft(snapshot(data.settings, data.reminders));
  }, [data.settings, data.reminders]);

  const zones = TIMEZONES.some((zone) => zone.id === draft.timezone)
    ? TIMEZONES
    : [{ id: draft.timezone, label: draft.timezone }, ...TIMEZONES];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const monthly = parseAmount(draft.monthly);
    const weekly = parseAmount(draft.weekly);
    if (monthly === null || monthly <= 0 || weekly === null || weekly <= 0) {
      setError("Escribe un presupuesto mensual y uno semanal mayores a cero.");
      return;
    }
    if (draft.reminders.some((reminder) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time))) {
      setError("Revisa la hora de los recordatorios. Usa un formato como 09:00.");
      return;
    }
    setError("");
    saveSettings(
      {
        currency: "MXN",
        monthlyBudget: money(monthly),
        weeklyBudget: money(weekly),
        timezone: draft.timezone,
        demoMode: draft.demoMode,
      },
      draft.reminders,
    );
    notify("Preferencias guardadas en este navegador.");
  };

  const exportJson = () => {
    downloadText("canasta-datos.json", buildExportJson(data), "application/json");
    notify("Descargamos el JSON local.");
  };
  const exportExpenses = () => {
    downloadText("canasta-compras.csv", buildExpensesCsv(data), "text/csv;charset=utf-8");
    notify("Descargamos el CSV de compras.");
  };
  const exportHabits = () => {
    downloadText("canasta-habitos.csv", buildHabitsCsv(data), "text/csv;charset=utf-8");
    notify("Descargamos el CSV de hábitos.");
  };

  return (
    <div className="stack settings-layout">
      <form className="card stack" onSubmit={onSubmit} noValidate>
        <h2>Presupuesto</h2>
        {error ? (
          <p className="form-alert" role="alert">
            {error}
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="moneda">Moneda</label>
          <input id="moneda" value="Peso mexicano (MXN)" readOnly />
          <p className="hint">En este prototipo la moneda es fija y los montos se muestran en formato es-MX.</p>
        </div>
        <div className="field">
          <label htmlFor="presupuesto-mes">Presupuesto mensual</label>
          <input
            id="presupuesto-mes"
            inputMode="decimal"
            value={draft.monthly}
            aria-describedby="presupuesto-ayuda"
            onChange={(event) => setDraft({ ...draft, monthly: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="presupuesto-semana">Presupuesto semanal</label>
          <input
            id="presupuesto-semana"
            inputMode="decimal"
            value={draft.weekly}
            aria-describedby="presupuesto-ayuda"
            onChange={(event) => setDraft({ ...draft, weekly: event.target.value })}
          />
          <p id="presupuesto-ayuda" className="hint">
            El semanal es una referencia aparte. No tiene que coincidir con el mensual dividido entre cuatro. Los retos pueden usar otro tope.
          </p>
        </div>
        <div className="field">
          <label htmlFor="zona">Zona horaria</label>
          <select id="zona" value={draft.timezone} onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>
          <p className="hint">“Hoy” en hábitos y recordatorios usa esta zona.</p>
        </div>
        <div className="check-row">
          <input
            id="modo-demo"
            type="checkbox"
            checked={draft.demoMode}
            onChange={(event) => setDraft({ ...draft, demoMode: event.target.checked })}
          />
          <label htmlFor="modo-demo">Mostrar la etiqueta de modo demostración</label>
        </div>

        <fieldset className="stack-sm">
          <legend>Recordatorios dentro de la app</legend>
          <p className="hint">
            Canasta solo muestra estos avisos aquí. No pedimos permiso para notificaciones del navegador. El envío por Web Push queda preparado en el código, pero no está conectado.
          </p>
          {draft.reminders.map((reminder) => (
            <div className="reminder-edit" key={reminder.id}>
              <div className="check-row">
                <input
                  id={`aviso-${reminder.id}`}
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      reminders: draft.reminders.map((item) => (item.id === reminder.id ? { ...item, enabled: event.target.checked } : item)),
                    })
                  }
                />
                <label htmlFor={`aviso-${reminder.id}`}>{reminder.title}</label>
              </div>
              <p className="hint">{reminder.body}</p>
              <div className="inline-fields">
                <div className="field">
                  <label htmlFor={`hora-${reminder.id}`}>Hora</label>
                  <input
                    id={`hora-${reminder.id}`}
                    type="time"
                    value={reminder.time}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        reminders: draft.reminders.map((item) => (item.id === reminder.id ? { ...item, time: event.target.value } : item)),
                      })
                    }
                  />
                </div>
                {reminder.schedule === "weekly" ? (
                  <div className="field">
                    <label htmlFor={`dia-${reminder.id}`}>Día</label>
                    <select
                      id={`dia-${reminder.id}`}
                      value={reminder.weekday ?? 0}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          reminders: draft.reminders.map((item) =>
                            item.id === reminder.id ? { ...item, weekday: Number(event.target.value) } : item,
                          ),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <option key={day} value={day}>
                          {weekdayLong(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </fieldset>
        <button type="submit" className="btn btn-primary">
          Guardar preferencias
        </button>
      </form>

      <section className="card stack">
        <h2>Exportar</h2>
        <p>Los archivos salen de lo que está guardado en este navegador. No se envían a ningún servidor.</p>
        <p className="hint">En el CSV de compras cada fila es un ticket. Los artículos van juntos para no duplicar el importe.</p>
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={exportJson}>
            Descargar JSON
          </button>
          <button type="button" className="btn btn-ghost" onClick={exportExpenses}>
            Descargar compras (CSV)
          </button>
          <button type="button" className="btn btn-ghost" onClick={exportHabits}>
            Descargar hábitos (CSV)
          </button>
        </div>
      </section>

      <section className="card stack">
        <h2>Datos de demostración</h2>
        <p>
          Restaurar reemplaza compras, hábitos, retos, presupuesto y recordatorios de Canasta. Solo borra la clave de esta app en el navegador.
        </p>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmRestore(true)}>
          Restaurar datos de demostración
        </button>
      </section>

      <section className="card stack">
        <h2>Integraciones simuladas</h2>
        <ul className="plain">
          <li>Precios de tiendas: catálogo local, sin vigencia real ni enlace de compra.</li>
          <li>Recordatorios: solo dentro de Canasta. Web Push no está conectado.</li>
          <li>Guardado: localStorage en este navegador. No hay cuenta ni nube.</li>
        </ul>
      </section>

      {confirmRestore ? (
        <ConfirmDialog
          title="Restaurar demostración"
          body="¿Restaurar los datos de demostración? Se reemplazan compras, hábitos, retos, presupuestos y recordatorios de Canasta en este navegador. No se borra nada más."
          confirmLabel="Restaurar"
          danger
          onCancel={() => setConfirmRestore(false)}
          onConfirm={() => {
            restoreDemo();
            setConfirmRestore(false);
            notify("Volvimos a los datos de demostración.");
          }}
        />
      ) : null}
    </div>
  );
}

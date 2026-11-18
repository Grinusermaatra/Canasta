import { useEffect, useState } from "react";
import { calendarCells, habitCount, habitStreak } from "../domain/calculations";
import { addDays, formatLongDate, weekdayShort } from "../domain/dates";
import { useCanasta } from "../state/CanastaContext";

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function HabitsView() {
  const { data, today, toggleCheckIn, notify } = useCanasta();
  const [selected, setSelected] = useState(today);

  useEffect(() => {
    if (selected > today) setSelected(today);
  }, [selected, today]);

  const streak = habitStreak(data.checkIns, today);
  const strip = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const windowStart = addDays(today, -6);
  const cells = calendarCells(today);
  const selectedLabel = selected === today ? "Hoy" : formatLongDate(selected);

  const toggle = (habitId: string) => {
    const wasOn = data.checkIns.some((checkIn) => checkIn.habitId === habitId && checkIn.date === selected);
    toggleCheckIn(habitId, selected);
    notify(wasOn ? "Quitamos ese registro." : "Hábito registrado.");
  };

  return (
    <div className="stack">
      <p className="banner-note" role="note">
        Esto es un registro personal para observar hábitos. Canasta no diagnostica ni sustituye la orientación de un profesional de la salud.
      </p>
      <section className="card">
        <div className="section-head">
          <h2>{selectedLabel}</h2>
          <p className="muted">{selected === today ? "Marca solo lo que sí hiciste." : "Puedes corregir este día."}</p>
        </div>
        <div className="habit-list">
          {data.habits.map((habit) => {
            const on = data.checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.date === selected);
            return (
              <button key={habit.id} type="button" className={on ? "habit on" : "habit"} aria-pressed={on} onClick={() => toggle(habit.id)}>
                <span className="habit-mark" aria-hidden="true">
                  {on ? "✓" : ""}
                </span>
                <span>
                  <strong>{habit.name}</strong>
                  <small>{habit.hint}</small>
                </span>
              </button>
            );
          })}
        </div>
        <p className="hint">
          {data.checkIns.some((checkIn) => checkIn.date === selected)
            ? "Gracias por anotarlo. No hace falta completar los tres."
            : "Nada registrado este día. Si quieres, márcalo ahora. Un día en blanco no arruina nada."}
        </p>
      </section>

      <section className="card">
        <h2>Racha</h2>
        <p className="stat-value">
          {streak} {streak === 1 ? "día" : "días"}
        </p>
        <p>
          {streak === 0
            ? "La racha cuenta días seguidos con al menos un hábito. Empieza cuando tú quieras."
            : "Días seguidos con al menos un registro. No se exige marcar todo."}
        </p>
      </section>

      <section className="card">
        <h2>Últimos 7 días</h2>
        <div className="day-strip" role="group" aria-label="Elegir un día reciente">
          {strip.map((date) => {
            const count = data.habits.filter((habit) =>
              data.checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.date === date),
            ).length;
            return (
              <button
                key={date}
                type="button"
                className={selected === date ? "day on" : "day"}
                aria-pressed={selected === date}
                aria-label={`${formatLongDate(date)}, ${count} ${count === 1 ? "hábito" : "hábitos"}`}
                onClick={() => setSelected(date)}
              >
                <span>{weekdayShort(date)}</span>
                <strong>{date.slice(-2)}</strong>
                {count > 0 ? <span className="dot" aria-hidden="true" /> : <span className="dot empty" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <ul className="summary">
          {data.habits.map((habit) => {
            const count = habitCount(data.checkIns, habit.id, windowStart, today);
            return (
              <li key={habit.id}>
                <div>
                  <span>{habit.name}</span>
                  <strong>
                    {count} de 7 días
                  </strong>
                </div>
                <span className="mini" aria-hidden="true">
                  <span style={{ width: `${(count / 7) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        <p className="hint">El resumen cuenta lo que sí pasó, de hoy hacia atrás. Incluye el día seleccionado solo si cae en esta ventana.</p>
      </section>

      <section className="card">
        <h2>Este mes</h2>
        <div className="cal" role="grid" aria-label={`Calendario de ${formatLongDate(today).split(" de ").slice(1).join(" de ")}`}>
          {WEEKDAY_HEADERS.map((label) => (
            <div key={label} className="cal-head" role="columnheader">
              {label}
            </div>
          ))}
          {cells.map((cell) => {
            if (!cell.inMonth) return <div key={cell.date} className="cal-empty" />;
            const count = data.habits.filter((habit) =>
              data.checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.date === cell.date),
            ).length;
            const future = cell.date > today;
            return (
              <button
                key={cell.date}
                type="button"
                role="gridcell"
                className={selected === cell.date ? "cal-cell on" : "cal-cell"}
                disabled={future}
                aria-pressed={selected === cell.date}
                aria-current={cell.date === today ? "date" : undefined}
                aria-label={`${formatLongDate(cell.date)}, ${future ? "todavía no llega" : `${count} ${count === 1 ? "hábito" : "hábitos"}`}`}
                onClick={() => setSelected(cell.date)}
              >
                <span>{Number(cell.date.slice(-2))}</span>
                {count > 0 ? <span className="dot" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        <p className="hint">El calendario empieza en lunes. El punto marca un día con algún hábito, no una calificación.</p>
      </section>
    </div>
  );
}

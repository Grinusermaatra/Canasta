import { featuredOffers, habitStreak, spendByCategory, sumExpenses, weekSeries, challengeProgress } from "../domain/calculations";
import { storeName } from "../domain/constants";
import { formatMonth, monthToDate, previousWeek, weekToDate } from "../domain/dates";
import { formatMXN } from "../domain/money";
import { inAppReminders } from "../services/reminders";
import { useCanasta } from "../state/CanastaContext";
import { WeekChart } from "../components/Charts";
import { ProgressBar } from "../components/ui";

export function HomeView() {
  const { data, now, today, offers, dismissReminder, notify } = useCanasta();
  const month = monthToDate(today);
  const week = weekToDate(today);
  const lastWeek = previousWeek(today);
  const monthSpent = sumExpenses(data.expenses, month.start, month.end);
  const weekSpent = sumExpenses(data.expenses, week.start, week.end);
  const lastWeekSpent = sumExpenses(data.expenses, lastWeek.start, lastWeek.end);
  const budget = data.settings.monthlyBudget;
  const remaining = budget - monthSpent;
  const streak = habitStreak(data.checkIns, today);
  const categories = spendByCategory(data.expenses, month.start, month.end);
  const categoryTotal = categories.reduce((sum, row) => sum + row.amount, 0);
  const weeks = weekSeries(data.expenses, today);
  const goal = data.challenges.find((challenge) => challenge.status === "active") ?? data.challenges[0];
  const goalProgress = goal ? challengeProgress(goal, data.expenses, data.checkIns, today) : null;
  const reminders = inAppReminders.upcoming({
    reminders: data.reminders,
    dismissed: data.dismissedReminders,
    today,
    now,
    timeZone: data.settings.timezone,
  });
  const highlighted = featuredOffers(offers, today);

  return (
    <div className="home-grid">
      <section className="card hero">
        <p className="eyebrow">{formatMonth(today.slice(0, 7))}</p>
        <h2>Gasto del mes</h2>
        <p className="hero-amount">{formatMXN(monthSpent)}</p>
        <p className="hero-sub">
          {budget <= 0
            ? "Define un presupuesto mensual en Ajustes para ver cuánto te queda."
            : remaining >= 0
              ? `Te quedan ${formatMXN(remaining)} de ${formatMXN(budget)}.`
              : `Vas ${formatMXN(Math.abs(remaining))} arriba del presupuesto de ${formatMXN(budget)}.`}
        </p>
        {budget > 0 ? (
          <ProgressBar
            ratio={monthSpent / budget}
            tone={monthSpent > budget ? "over" : "ok"}
            label={`Gasto del mes: ${formatMXN(monthSpent)} de ${formatMXN(budget)}`}
          />
        ) : null}
        <div className="quick">
          <a className="btn btn-primary" href="#/gastos?nueva=1">
            Registrar compra
          </a>
          <a className="btn btn-ghost" href="#/habitos">
            Hábitos de hoy
          </a>
        </div>
      </section>

      <div className="stack">
        <article className="card stat">
          <h2>Esta semana</h2>
          <p className="stat-value">{formatMXN(weekSpent)}</p>
          <p>De lunes a hoy · presupuesto {formatMXN(data.settings.weeklyBudget)}</p>
          <p className="muted">Semana pasada cerró en {formatMXN(lastWeekSpent)}.</p>
        </article>
        <article className="card stat">
          <h2>Racha</h2>
          <p className="stat-value">
            {streak} {streak === 1 ? "día" : "días"}
          </p>
          <p>
            {streak === 0
              ? "Cuando registres un hábito, la racha aparece aquí. No hay prisa."
              : "Días seguidos con al menos un hábito. No tienen que ser todos."}
          </p>
        </article>
      </div>

      <section className="card span-2">
        <div className="section-head">
          <h2>Últimas 6 semanas</h2>
          <p className="muted">La semana en curso solo incluye hasta hoy. Los montos salen de tus compras.</p>
        </div>
        <WeekChart points={weeks} />
      </section>

      <section className="card">
        <h2>En qué se fue el mes</h2>
        {categories.length === 0 ? (
          <p className="muted">Todavía no hay compras en este mes.</p>
        ) : (
          <ul className="cat-list">
            {categories.map((row) => (
              <li key={row.category}>
                <div>
                  <span>{row.name}</span>
                  <strong>{formatMXN(row.amount)}</strong>
                </div>
                <span className="mini">
                  <span style={{ width: `${categoryTotal > 0 ? (row.amount / categoryTotal) * 100 : 0}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">Cada compra usa la categoría que elegiste al registrarla.</p>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Meta activa</h2>
          <a href="#/retos">Ver retos</a>
        </div>
        {goal && goalProgress ? (
          <>
            <h3>{goal.title}</h3>
            <p className="pill-row">
              <span className={`pill ${goalProgress.tone}`}>{goalProgress.statusLabel}</span>
            </p>
            <p>{goalProgress.detail}</p>
            <ProgressBar ratio={goalProgress.ratio} tone={goalProgress.tone} label={goalProgress.detail} />
          </>
        ) : (
          <p className="muted">No tienes retos activos. Puedes elegir uno cuando quieras.</p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Próximos recordatorios</h2>
          <a href="#/ajustes">Preferencias</a>
        </div>
        {reminders.length === 0 ? (
          <p className="muted">No hay avisos pendientes. Puedes activarlos en Ajustes. Solo aparecen dentro de Canasta.</p>
        ) : (
          <ul className="plain-list">
            {reminders.map((reminder) => (
              <li key={reminder.occurrenceId}>
                <div>
                  <strong>{reminder.title}</strong>
                  <p>{reminder.body}</p>
                  <p className="muted">{reminder.whenLabel}</p>
                </div>
                {reminder.due ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      dismissReminder(reminder.occurrenceId);
                      notify("Listo. Ocultamos ese aviso de hoy.");
                    }}
                  >
                    Marcar como visto
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Ofertas de ejemplo</h2>
          <a href="#/ofertas">Ver todas</a>
        </div>
        <ul className="offer-mini">
          {highlighted.map((offer) => (
            <li key={offer.id}>
              <div>
                <strong>{offer.productName}</strong>
                <p className="muted">{storeName(offer.storeId)} · ejemplo</p>
              </div>
              <strong>{formatMXN(offer.price)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

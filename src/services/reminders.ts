import { addDays, formatDayMonth, isISODate, timeInZone, weekdayIndex, weekdayLong } from "../domain/dates";
import type { Reminder } from "../domain/types";

export interface ReminderOccurrence {
  occurrenceId: string;
  reminderId: string;
  title: string;
  body: string;
  date: string;
  time: string;
  due: boolean;
  whenLabel: string;
}

export interface ReminderQuery {
  reminders: Reminder[];
  dismissed: string[];
  today: string;
  now: Date;
  timeZone: string;
  limit?: number;
}

/**
 * INTEGRACIÓN: contrato de recordatorios.
 * InAppReminderService solo calcula avisos para mostrarlos en Canasta.
 * Web Push podría implementar el mismo `upcoming` y agregar subscribe()/deliver().
 * Este prototipo no pide permiso de notificaciones.
 */
export interface ReminderService {
  upcoming(query: ReminderQuery): ReminderOccurrence[];
}

function nextOccurrence(reminder: Reminder, today: string, dismissed: Set<string>): string | null {
  const pending = (date: string) => !dismissed.has(`${reminder.id}:${date}`);
  if (reminder.schedule === "daily") {
    if (pending(today)) return today;
    const tomorrow = addDays(today, 1);
    return pending(tomorrow) ? tomorrow : null;
  }
  let cursor = today;
  for (let step = 0; step < 14; step += 1) {
    if (weekdayIndex(cursor) === (reminder.weekday ?? 0) && pending(cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return null;
}

function whenLabel(date: string, today: string, time: string, due: boolean): string {
  if (date === today && due) return `Pendiente hoy · ${time}`;
  if (date === today) return `Hoy · ${time}`;
  if (date === addDays(today, 1)) return `Mañana · ${time}`;
  const dayName = weekdayLong(weekdayIndex(date));
  const label = `${dayName.charAt(0).toLocaleUpperCase("es-MX")}${dayName.slice(1)}`;
  return `${label} ${formatDayMonth(date)} · ${time}`;
}

export const inAppReminders: ReminderService = {
  upcoming(query) {
    const limit = query.limit ?? 4;
    const clock = timeInZone(query.now, query.timeZone);
    const dismissed = new Set(query.dismissed);
    const items: ReminderOccurrence[] = [];

    for (const reminder of query.reminders) {
      if (!reminder.enabled || !/^\d{2}:\d{2}$/.test(reminder.time)) continue;
      const date = nextOccurrence(reminder, query.today, dismissed);
      if (!date || !isISODate(date)) continue;
      const due = date === query.today && clock >= reminder.time;
      items.push({
        occurrenceId: `${reminder.id}:${date}`,
        reminderId: reminder.id,
        title: reminder.title,
        body: reminder.body,
        date,
        time: reminder.time,
        due,
        whenLabel: whenLabel(date, query.today, reminder.time, due),
      });
    }

    return items
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, limit);
  },
};

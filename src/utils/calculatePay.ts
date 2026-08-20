import type { DailyLog, PeriodSummary } from '../types';
import { formatDateKey } from './dateUtils';

/**
 * Aggregates manually logged daily earnings across a period,
 * tracking attendance breakdown by dayType.
 *
 * @param daysInPeriod    Array of dates in the target period
 * @param logsMap         Map of daily logs keyed by date string (YYYY-MM-DD)
 * @param periodLabel     Display label for the period
 * @param workdays        Array of scheduled workday indices (0=Sun … 6=Sat)
 * @param holidays        Array of holiday date strings (YYYY-MM-DD)
 */
export function calculatePeriodSummary(
  daysInPeriod: Date[],
  logsMap: Record<string, DailyLog>,
  periodLabel: string,
  workdays: number[] = [],
  holidays: string[] = []
): PeriodSummary {
  const holidaySet = new Set(holidays);
  let totalEarned = 0;
  let daysLogged = 0;
  let scheduledWorkdays = 0;
  let attendances = 0;
  let leaves = 0;
  let absences = 0;
  let holidayCount = 0;

  for (const date of daysInPeriod) {
    const key = formatDateKey(date);
    const isScheduledWorkday = workdays.includes(date.getDay()) && !holidaySet.has(key);
    if (!isScheduledWorkday) continue;

    scheduledWorkdays++;
    const log = logsMap[key];
    if (!log) continue;

    const dayType = log.dayType ?? 'work';

    if (dayType === 'absent') {
      absences++;
      // absent = zero pay, don't count as daysLogged
    } else if (dayType === 'leave') {
      leaves++;
      totalEarned += log.amount;
      if (log.amount > 0) daysLogged++;
    } else if (dayType === 'holiday') {
      holidayCount++;
      totalEarned += log.amount;
      if (log.amount > 0) daysLogged++;
    } else {
      // 'work' or undefined
      if (log.amount > 0) {
        attendances++;
        totalEarned += log.amount;
        daysLogged++;
      }
    }
  }

  return {
    periodLabel,
    totalEarned,
    daysLogged,
    scheduledWorkdays,
    attendances,
    leaves,
    absences,
    holidayCount,
  };
}

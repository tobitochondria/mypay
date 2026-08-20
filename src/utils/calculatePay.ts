import type { DailyLog, PeriodSummary } from '../types';
import { formatDateKey } from './dateUtils';

/**
 * Aggregates manually logged daily earnings across a period.
 *
 * @param daysInPeriod Array of dates in the target period
 * @param logsMap Map of daily logs keyed by date string (YYYY-MM-DD)
 * @param periodLabel Display label for the period
 */
export function calculatePeriodSummary(
  daysInPeriod: Date[],
  logsMap: Record<string, DailyLog>,
  periodLabel: string
): PeriodSummary {
  let totalEarned = 0;
  let daysLogged = 0;

  for (const date of daysInPeriod) {
    const log = logsMap[formatDateKey(date)];
    if (log && log.amount > 0) {
      totalEarned += log.amount;
      daysLogged++;
    }
  }

  return {
    periodLabel,
    totalEarned,
    daysLogged,
    averagePerDay: daysLogged > 0 ? totalEarned / daysLogged : 0
  };
}

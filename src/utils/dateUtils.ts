import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  getDaysInMonth,
} from 'date-fns';
import type { PaydayMode } from '../types';

export function getMonthCalendarDays(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}



/**
 * Returns all nominal payday day-numbers for a given month+mode.
 * Monthly   → [end-of-month]
 * Semimonthly → [15, end-of-month]
 */
export function getNominalPaydays(
  year: number,
  month: number,
  mode: PaydayMode
): number[] {
  const endDay = getDaysInMonth(new Date(year, month, 1));
  return mode === 'semimonthly' ? [15, endDay] : [endDay];
}

/**
 * Computes the actual credited payday date applying Philippine banking rules.
 * - Saturday  → Friday (−1)
 * - Sunday    → Friday (−2)
 * - Holiday   → back 1 day, then re-evaluate
 */
export function getActualPayday(
  year: number,
  month: number,
  period: 'period-1' | 'period-2',
  holidays: string[]
): Date {
  // For monthly mode period-1 doesn't really exist, but guard anyway
  const holidaySet = new Set(holidays);
  let nominalDay: number;
  if (period === 'period-1') {
    nominalDay = 15;
  } else {
    nominalDay = getDaysInMonth(new Date(year, month, 1));
  }

  let payday = new Date(year, month, nominalDay);
  for (let i = 0; i < 7; i++) {
    const dow = getDay(payday);
    const key = formatDateKey(payday);
    if (dow === 6) {
      payday = new Date(payday.getFullYear(), payday.getMonth(), payday.getDate() - 1);
    } else if (dow === 0) {
      payday = new Date(payday.getFullYear(), payday.getMonth(), payday.getDate() - 2);
    } else if (holidaySet.has(key)) {
      payday = new Date(payday.getFullYear(), payday.getMonth(), payday.getDate() - 1);
    } else {
      break;
    }
  }
  return payday;
}

export function getPeriodKey(
  year: number,
  month: number,
  period: 'period-1' | 'period-2'
): string {
  const mm = String(month + 1).padStart(2, '0');
  return `${year}-${mm}-${period}`;
}

/**
 * Returns the next upcoming pay period based on today's date and payday mode.
 * Monthly mode   → always period-2 of the current month
 * Semimonthly   → period-1 if today ≤ 15, else period-2
 */
export function getNextPeriod(
  today: Date,
  mode: PaydayMode = 'semimonthly'
): { year: number; month: number; period: 'period-1' | 'period-2' } {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (mode === 'monthly') {
    return { year, month, period: 'period-2' };
  }
  return { year, month, period: day <= 15 ? 'period-1' : 'period-2' };
}

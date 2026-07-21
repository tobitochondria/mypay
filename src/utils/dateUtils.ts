import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  getDay, 
  subDays,
  addDays
} from 'date-fns';
import Holidays from 'date-holidays';
import type { WorkSchedule, Holiday, PaymentFrequency, PaydayRule } from '../types';

// Map day index (0 = Sunday ... 6 = Saturday) to WorkSchedule key
const DAY_KEYS: (keyof WorkSchedule)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Checks whether a given date falls on a scheduled work day according to the job profile schedule.
 * For Contractual employment, holidays are not scheduled work days ("Off").
 */
export function isScheduledWorkDay(
  date: Date, 
  schedule: WorkSchedule, 
  startDate?: string, 
  endDate?: string,
  holidays?: Holiday[] | Map<string, Holiday>,
  employmentType?: 'regular' | 'contractual'
): boolean {
  const dateStr = formatDateKey(date);

  // Date range boundary guard clauses
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;

  // For Contractual employment, holidays are non-working ("Off")
  if (employmentType === 'contractual' && holidays) {
    const isHoliday = holidays instanceof Map 
      ? holidays.has(dateStr) 
      : holidays.some(h => h.date === dateStr);
    if (isHoliday) return false;
  }

  const dayIndex = getDay(date);
  const dayKey = DAY_KEYS[dayIndex];
  return Boolean(schedule[dayKey]);
}

/**
 * Generates an array of Date objects covering the full 7-column calendar grid for a given month.
 */
export function getMonthCalendarDays(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday-start grid
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Fetches national public holidays for a given country code and year.
 * Returns default Philippines (PH) holiday fallback if fetching fails.
 */
export function fetchCountryHolidays(countryCode: string, year: number): Holiday[] {
  const holidays: Holiday[] = [];

  try {
    const hd = new Holidays(countryCode);
    const rawHolidays = hd.getHolidays(year);

    if (Array.isArray(rawHolidays)) {
      rawHolidays.forEach((h, idx) => {
        const dateStr = typeof h.date === 'string' 
          ? h.date.substring(0, 10) 
          : format(new Date(h.date), 'yyyy-MM-dd');

        const isRegular = h.type === 'public';
        holidays.push({
          id: `auto-${countryCode}-${year}-${idx}`,
          date: dateStr,
          name: h.name,
          type: isRegular ? 'regular' : 'special',
          multiplier: isRegular ? 2.0 : 1.3,
          isCustom: false
        });
      });
    }
  } catch (err) {
    // Silent fallback catch
  }

  // Fallback defaults for Philippines if PH is selected or fetch returned empty
  if (holidays.length === 0 && countryCode === 'PH') {
    return [
      { id: 'ph-1', date: `${year}-01-01`, name: "New Year's Day", type: 'regular', multiplier: 2.0 },
      { id: 'ph-2', date: `${year}-04-09`, name: 'Araw ng Kagitingan', type: 'regular', multiplier: 2.0 },
      { id: 'ph-3', date: `${year}-05-01`, name: 'Labor Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-4', date: `${year}-06-12`, name: 'Independence Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-5', date: `${year}-08-26`, name: 'National Heroes Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-6', date: `${year}-11-30`, name: 'Bonifacio Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-7', date: `${year}-12-25`, name: 'Christmas Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-8', date: `${year}-12-30`, name: 'Rizal Day', type: 'regular', multiplier: 2.0 },
      { id: 'ph-9', date: `${year}-11-01`, name: 'All Saints Day', type: 'special', multiplier: 1.3 },
      { id: 'ph-10', date: `${year}-12-31`, name: 'Last Day of the Year', type: 'special', multiplier: 1.3 },
    ];
  }

  return holidays;
}

/**
 * Calculates raw scheduled payday target dates for a given month.
 */
export function getRawPaydayDates(year: number, month: number, frequency: PaymentFrequency): Date[] {
  const monthDate = new Date(year, month, 1);
  const monthEnd = endOfMonth(monthDate);
  const lastDay = monthEnd.getDate();

  if (frequency === 'semi-monthly') {
    return [
      new Date(year, month, 15),
      new Date(year, month, lastDay)
    ];
  }

  return [new Date(year, month, lastDay)];
}

/**
 * Applies payday rules (e.g., "On or Before Payday") when payday lands on a weekend or holiday.
 */
export function adjustPaydayDate(
  rawDate: Date, 
  rule: PaydayRule, 
  holidays: Holiday[]
): Date {
  if (rule === 'exact') return rawDate;

  let currentDate = new Date(rawDate);
  const holidaySet = new Set(holidays.map(h => h.date));

  const isNonWorking = (d: Date): boolean => {
    const dayOfWeek = getDay(d);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = formatDateKey(d);
    return isWeekend || holidaySet.has(dateStr);
  };

  if (rule === 'on-or-before') {
    while (isNonWorking(currentDate)) {
      currentDate = subDays(currentDate, 1);
    }
  } else if (rule === 'after') {
    while (isNonWorking(currentDate)) {
      currentDate = addDays(currentDate, 1);
    }
  }

  return currentDate;
}

/**
 * Formats a Date object into standard YYYY-MM-DD string key format.
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

import type { JobProfile, DailyLog, Holiday, PaySummary, ItemizedDeduction } from '../types';
import { isScheduledWorkDay, formatDateKey } from './dateUtils';

export interface DailyEarnedDetails {
  baseEarned: number;
  overtimeEarned: number;
  undertimeDeduction: number;
  holidayBonus: number;
  totalDailyEarned: number;
  isHoliday: boolean;
  holidayInfo?: Holiday;
}

/**
 * Calculates financial earnings for a single day log.
 *
 * @param date Target date
 * @param log Daily log entry containing attendance and manual override details
 * @param profile Active job profile containing wage rates and multipliers
 * @param holidays List or map of active holidays
 */
export function calculateDailyEarnings(
  date: Date,
  log: DailyLog | undefined,
  profile: JobProfile,
  holidays: Holiday[] | Map<string, Holiday>
): DailyEarnedDetails {
  const dateStr = formatDateKey(date);
  const isScheduled = isScheduledWorkDay(date, profile.workSchedule, profile.startDate, profile.endDate, holidays, profile.employmentType);

  // Fast O(1) holiday lookup if Map, fallback to O(N) array search
  const holiday = holidays instanceof Map 
    ? holidays.get(dateStr) 
    : holidays.find(h => h.date === dateStr);

  const isHoliday = Boolean(holiday);

  const hourlyRate = profile.shiftLengthHours > 0 
    ? profile.dailyRate / profile.shiftLengthHours 
    : 0;

  const status = log?.status || (isScheduled ? 'scheduled' : 'rest-day');
  const otHours = Math.max(0, log?.overtimeHours || 0);
  const utHours = Math.max(0, log?.undertimeHours || 0);

  // Determine Base Pay
  let baseEarned = 0;
  const isBasePayEligibleStatus = ['rendered', 'overtime', 'undertime', 'paid-leave', 'scheduled'].includes(status);
  if (isBasePayEligibleStatus) {
    baseEarned = profile.dailyRate;
  }

  // Calculate Overtime & Undertime
  const overtimeEarned = otHours > 0 ? otHours * hourlyRate * (profile.otMultiplier || 1.25) : 0;
  const undertimeDeduction = utHours > 0 ? utHours * hourlyRate : 0;

  // Calculate Holiday Premium (Regular employment gets multipliers; Contractual does not)
  let holidayBonus = 0;
  const isContractual = profile.employmentType === 'contractual';
  const qualifiesForHolidayBonus = isHoliday && !isContractual && (baseEarned > 0 || otHours > 0);

  if (qualifiesForHolidayBonus && holiday) {
    const multiplier = holiday.multiplier || 1.0;
    if (multiplier > 1.0) {
      holidayBonus = baseEarned * (multiplier - 1.0);
    }
  }

  // Determine Total Daily Earnings (Honor manual override if present)
  const hasManualOverride = log?.customEarnings !== undefined && log?.customEarnings !== null;
  const totalDailyEarned = hasManualOverride
    ? Math.max(0, log.customEarnings!)
    : Math.max(0, baseEarned + overtimeEarned - undertimeDeduction + holidayBonus);

  return {
    baseEarned,
    overtimeEarned,
    undertimeDeduction,
    holidayBonus,
    totalDailyEarned,
    isHoliday,
    holidayInfo: holiday
  };
}

/**
 * Aggregates monthly or pay period earnings and calculates itemized deductions.
 *
 * @param daysInPeriod Array of dates in the target period
 * @param logsMap Map of daily logs keyed by date string (YYYY-MM-DD)
 * @param profile Active job profile configuration
 * @param holidays List of applicable holidays
 * @param periodLabel Display label for the period
 */
export function calculatePaySummary(
  daysInPeriod: Date[],
  logsMap: Record<string, DailyLog>,
  profile: JobProfile,
  holidays: Holiday[],
  periodLabel: string
): PaySummary {
  // Pre-index holidays for O(1) fast lookup
  const holidayMap = new Map<string, Holiday>(holidays.map(h => [h.date, h]));

  let baseEarnings = 0;
  let overtimePay = 0;
  let undertimeDeductions = 0;
  let holidayBonusPay = 0;
  let daysRendered = 0;
  let scheduledDaysCount = 0;
  let totalDailyEarnedSum = 0;

  for (const date of daysInPeriod) {
    const dateStr = formatDateKey(date);
    const log = logsMap[dateStr];
    const isScheduled = isScheduledWorkDay(date, profile.workSchedule, profile.startDate, profile.endDate, holidayMap, profile.employmentType);

    if (isScheduled) {
      scheduledDaysCount++;
    }

    const details = calculateDailyEarnings(date, log, profile, holidayMap);

    baseEarnings += details.baseEarned;
    overtimePay += details.overtimeEarned;
    undertimeDeductions += details.undertimeDeduction;
    holidayBonusPay += details.holidayBonus;
    totalDailyEarnedSum += details.totalDailyEarned;

    const status = log?.status || (isScheduled ? 'scheduled' : 'rest-day');
    const isRenderedStatus = ['rendered', 'overtime', 'undertime', 'paid-leave'].includes(status);

    if (isRenderedStatus || (!log && isScheduled)) {
      daysRendered++;
    }
  }

  const grossPay = Math.max(0, totalDailyEarnedSum);

  // Calculate Tax Amount
  const taxDeduction = profile.taxDeduction;
  let taxAmount = 0;
  if (taxDeduction && taxDeduction.value > 0) {
    taxAmount = taxDeduction.type === 'percentage'
      ? (grossPay * taxDeduction.value) / 100
      : taxDeduction.value;
  }

  // Build Itemized Deductions list
  const itemizedDeductions: ItemizedDeduction[] = [];
  if (taxAmount > 0 && taxDeduction) {
    itemizedDeductions.push({
      id: 'tax',
      name: taxDeduction.name || 'Income Tax',
      amount: taxAmount
    });
  }

  let totalOtherDeductions = 0;
  for (const ded of profile.otherDeductions || []) {
    if (ded.value <= 0) continue;
    const amount = ded.type === 'percentage'
      ? (grossPay * ded.value) / 100
      : ded.value;

    totalOtherDeductions += amount;
    itemizedDeductions.push({
      id: ded.id,
      name: ded.name,
      amount
    });
  }

  const totalDeductions = taxAmount + totalOtherDeductions;
  const netPay = Math.max(0, grossPay - totalDeductions);

  return {
    periodLabel,
    grossPay,
    baseEarnings,
    overtimePay,
    undertimeDeductions,
    holidayBonusPay,
    taxAmount,
    itemizedDeductions,
    totalDeductions,
    netPay,
    daysRendered,
    scheduledDaysCount
  };
}

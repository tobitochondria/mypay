export type DeductionType = 'percentage' | 'fixed';

export interface Deduction {
  id: string;
  name: string;
  type: DeductionType;
  value: number; // e.g. 10 for 10% or 500 for $500/₱500
}

export interface WorkSchedule {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export type PaymentFrequency = 'semi-monthly' | 'monthly';
export type PaydayRule = 'on-or-before' | 'exact' | 'after';

export interface JobProfile {
  id: string;
  title: string;
  company: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (optional)
  currencySymbol: string;
  dailyRate: number;
  shiftLengthHours: number;
  otMultiplier: number;
  workSchedule: WorkSchedule;
  taxDeduction: Deduction;
  otherDeductions: Deduction[];
  paymentFrequency: PaymentFrequency;
  paydayRule: PaydayRule;
  employmentType?: 'regular' | 'contractual'; // Regular gets holiday multipliers, Contractual does not
  countryCode: string; // e.g., 'PH', 'US', 'GB', 'CA', 'AU'
  customHolidays: Holiday[];
}

export type DayWorkStatus = 
  | 'scheduled'      // Standard work day expected
  | 'rendered'       // Full standard shift completed
  | 'overtime'       // Base shift + extra overtime hours
  | 'undertime'      // Partial shift completed (with undertime hours)
  | 'paid-leave'     // Paid Vacation / Sick Leave (Full base pay)
  | 'absent'         // Unpaid absence
  | 'rest-day';      // Non-working day / Weekend off

export type PaydayStatus = 'scheduled' | 'received' | 'early' | 'delayed';

export type HolidayType = 'regular' | 'special';

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
  multiplier: number; // e.g. 2.0 for regular holiday, 1.3 for special non-working
  isCustom?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  status: DayWorkStatus;
  overtimeHours: number;
  undertimeHours: number;
  customEarnings?: number;
  notes?: string;
  paydayStatus?: PaydayStatus;
  overridePaydayDate?: string; // If delayed or customized
}

export interface ItemizedDeduction {
  id: string;
  name: string;
  amount: number;
}

export interface PaySummary {
  periodLabel: string;
  grossPay: number;
  baseEarnings: number;
  overtimePay: number;
  undertimeDeductions: number;
  holidayBonusPay: number;
  taxAmount: number;
  itemizedDeductions: ItemizedDeduction[];
  totalDeductions: number;
  netPay: number;
  daysRendered: number;
  scheduledDaysCount: number;
}

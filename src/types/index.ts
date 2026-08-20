export type DayType = 'work' | 'holiday' | 'leave' | 'absent';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
  dayType?: DayType; // undefined = untagged (treated as work)
}

export type PaydayMode = 'semimonthly' | 'monthly';

export interface AppSettings {
  currencySymbol: string;
  dailyPayRate: number;
  workdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  paydayMode: PaydayMode;
  claimedPeriods: string[]; // e.g. "2025-08-period-1"
}

export interface PeriodSummary {
  periodLabel: string;
  totalEarned: number;
  daysLogged: number;
  scheduledWorkdays: number;
  // Attendance breakdown (within scheduled workdays)
  attendances: number;  // dayType = 'work' (or undefined) with amount > 0
  leaves: number;       // dayType = 'leave'
  absences: number;     // dayType = 'absent'
  holidayCount: number; // dayType = 'holiday'
}

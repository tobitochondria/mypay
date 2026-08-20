export interface DailyLog {
  date: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
}

export type PaydayMode = 'semimonthly' | 'monthly';

export interface AppSettings {
  currencySymbol: string;
  dailyPayRate: number;
  workdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  paydayMode: PaydayMode;
  holidays: string[]; // YYYY-MM-DD strings (manual + synced)
  claimedPeriods: string[]; // e.g. "2025-08-period-1"
  googleCalendarApiKey: string;
}

export interface PeriodSummary {
  periodLabel: string;
  totalEarned: number;
  daysLogged: number;
  averagePerDay: number;
}

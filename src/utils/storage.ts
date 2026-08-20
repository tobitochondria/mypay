import type { AppSettings, DailyLog } from '../types';

const SETTINGS_KEY = 'mypay_settings';
const LOGS_KEY = 'mypay_logs';

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: '₱',
  dailyPayRate: 0,
  workdays: [1, 2, 3, 4, 5], // Mon–Fri
  paydayMode: 'semimonthly',
  claimedPeriods: [],
};

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...DEFAULT_SETTINGS, ...parsed } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* quota */ }
}

export function getStoredLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch { /* quota */ }
}

export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(LOGS_KEY);
  } catch { /* quota */ }
}

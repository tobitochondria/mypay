import type { JobProfile, DailyLog } from '../types';

const PROFILES_KEY = 'mypay_job_profiles';
const ACTIVE_PROFILE_KEY = 'mypay_active_profile_id';
const LOGS_KEY_PREFIX = 'mypay_logs_';

export const DEFAULT_PROFILES: JobProfile[] = [
  {
    id: 'profile-blank-1',
    title: 'My Job Profile',
    company: 'My Company',
    currencySymbol: '₱',
    dailyRate: 0,
    shiftLengthHours: 10,
    otMultiplier: 1.25,
    workSchedule: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: false,
      sun: false
    },
    taxDeduction: {
      id: 'tax-blank',
      name: 'Tax Deduction',
      type: 'percentage',
      value: 0
    },
    otherDeductions: [],
    paymentFrequency: 'semi-monthly',
    paydayRule: 'on-or-before',
    employmentType: 'regular',
    countryCode: 'PH',
    customHolidays: []
  }
];

/**
 * Loads stored job profiles from localStorage, returning default profile if empty or corrupted.
 */
export function getStoredProfiles(): JobProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return DEFAULT_PROFILES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

/**
 * Persists job profiles array to localStorage.
 */
export function saveStoredProfiles(profiles: JobProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Fail-safe catch for quota errors
  }
}

/**
 * Retrieves active profile ID from localStorage.
 */
export function getActiveProfileId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (id) return id;
  } catch {
    // Fail-safe catch
  }
  return DEFAULT_PROFILES[0].id;
}

/**
 * Persists active profile ID to localStorage.
 */
export function saveActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // Fail-safe catch
  }
}

/**
 * Loads stored daily logs for a specific profile ID.
 */
export function getStoredLogs(profileId: string): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(`${LOGS_KEY_PREFIX}${profileId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persists daily logs for a specific profile ID.
 */
export function saveStoredLogs(profileId: string, logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(`${LOGS_KEY_PREFIX}${profileId}`, JSON.stringify(logs));
  } catch {
    // Fail-safe catch
  }
}

/**
 * Clears all stored application data from localStorage.
 */
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(LOGS_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Fail-safe catch
  }
}

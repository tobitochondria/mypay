import React, { useState } from 'react';
import type { AppSettings } from '../../types';
import {
  Settings, HelpCircle, Trash2, X, Coins, DollarSign,
  CalendarDays, Bell, Plus, Minus, RefreshCw, Key
} from 'lucide-react';
import { startAppTour } from '../../utils/tour';
import { getActualPayday } from '../../utils/dateUtils';
import { fetchPhHolidays } from '../../utils/holidayUtils';
import { format } from 'date-fns';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetAllData?: () => void;
  onCloseDrawer?: () => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Sidebar: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onCloseDrawer
}) => {
  const [holidayInput, setHolidayInput] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const today = new Date();
  const previewYear = today.getFullYear();
  const previewMonth = today.getMonth();

  const payday2 = getActualPayday(previewYear, previewMonth, 'period-2', settings.holidays);
  const payday1 = settings.paydayMode === 'semimonthly'
    ? getActualPayday(previewYear, previewMonth, 'period-1', settings.holidays)
    : null;

  const toggleWorkday = (day: number) => {
    const updated = settings.workdays.includes(day)
      ? settings.workdays.filter(d => d !== day)
      : [...settings.workdays, day].sort((a, b) => a - b);
    onUpdateSettings({ ...settings, workdays: updated });
  };

  const addHoliday = () => {
    const trimmed = holidayInput.trim();
    if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return;
    if (settings.holidays.includes(trimmed)) { setHolidayInput(''); return; }
    onUpdateSettings({ ...settings, holidays: [...settings.holidays, trimmed].sort() });
    setHolidayInput('');
  };

  const removeHoliday = (h: string) => {
    onUpdateSettings({ ...settings, holidays: settings.holidays.filter(x => x !== h) });
  };

  const handleSyncHolidays = async () => {
    if (!settings.googleCalendarApiKey) return;
    setSyncing(true);
    setSyncMsg('');
    const fetched = await fetchPhHolidays(settings.googleCalendarApiKey, previewYear);
    if (!fetched) {
      setSyncMsg('❌ Failed. Check your API key.');
    } else {
      const merged = [...new Set([...settings.holidays, ...fetched])].sort();
      const added = merged.length - settings.holidays.length;
      onUpdateSettings({ ...settings, holidays: merged });
      setSyncMsg(`✅ Synced ${fetched.length} holidays (${added} new)`);
    }
    setSyncing(false);
  };

  return (
    <aside className="sidebar-container space-y-4">
      <div className="sidebar-header flex items-center justify-between gap-2">
        <h2 className="sidebar-title" style={{ whiteSpace: 'nowrap' }}>
          <Settings size={18} className="icon-primary" />
          <span>Settings</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            id="btn-take-tour"
            className="btn btn-xs btn-primary flex items-center gap-1.5 font-semibold touch-target"
            onClick={startAppTour}
            title="Start interactive tour"
            style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.625rem', minHeight: '32px' }}
          >
            <HelpCircle size={13} /><span>Tour</span>
          </button>
          {onCloseDrawer && (
            <button className="btn btn-ghost touch-target" onClick={onCloseDrawer} style={{ padding: '0.375rem' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Currency */}
      <div id="tour-currency-settings" className="sidebar-card space-y-2">
        <div className="card-header"><div className="card-header-title"><Coins size={14} className="icon" /><span>Currency</span></div></div>
        <label className="form-label">Currency Symbol</label>
        <input type="text" className="form-control" value={settings.currencySymbol} maxLength={3}
          onChange={(e) => onUpdateSettings({ ...settings, currencySymbol: e.target.value })} placeholder="₱" />
        <p className="text-xs text-muted">e.g. {settings.currencySymbol || '₱'}500.00</p>
      </div>

      {/* Pay Configuration */}
      <div className="sidebar-card space-y-2">
        <div className="card-header"><div className="card-header-title"><DollarSign size={14} className="icon" /><span>Pay Configuration</span></div></div>
        <label className="form-label">Default Daily Pay Rate</label>
        <div className="input-prefix-wrapper">
          <span className="input-prefix">{settings.currencySymbol || '₱'}</span>
          <input type="number" min="0" step="0.01" className="form-control"
            value={settings.dailyPayRate === 0 ? '' : settings.dailyPayRate}
            onChange={(e) => onUpdateSettings({ ...settings, dailyPayRate: Math.max(0, parseFloat(e.target.value) || 0) })}
            placeholder="0.00" />
        </div>
        <p className="text-xs text-muted">Pre-filled in the day modal on workdays.</p>
      </div>

      {/* Workday Schedule */}
      <div className="sidebar-card space-y-2">
        <div className="card-header"><div className="card-header-title"><CalendarDays size={14} className="icon" /><span>Workday Schedule</span></div></div>
        <p className="text-xs text-muted">Select your working days. These appear distinctly on the calendar.</p>
        <div className="flex gap-1 flex-wrap">
          {WEEKDAY_LABELS.map((label, i) => (
            <button key={i} onClick={() => toggleWorkday(i)}
              className={`workday-toggle-btn ${settings.workdays.includes(i) ? 'active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Payday Configuration */}
      <div className="sidebar-card space-y-3">
        <div className="card-header"><div className="card-header-title"><Bell size={14} className="icon" /><span>Payday Configuration</span></div></div>

        {/* Mode selector */}
        <div className="space-y-1.5">
          <label className="form-label">Pay Frequency</label>
          <div className="radio-button-group">
            <button
              className={`radio-btn ${settings.paydayMode === 'semimonthly' ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ ...settings, paydayMode: 'semimonthly' })}
            >Semimonthly</button>
            <button
              className={`radio-btn ${settings.paydayMode === 'monthly' ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ ...settings, paydayMode: 'monthly' })}
            >Monthly</button>
          </div>
          <p className="text-xs text-muted">
            {settings.paydayMode === 'semimonthly'
              ? '15th and end-of-month paydays'
              : 'End-of-month payday only (30th)'}
          </p>
        </div>

        {/* Payday preview */}
        <div className="payday-preview-box space-y-1.5">
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            This Month's Paydays
          </p>
          {payday1 && (
            <div className="payday-preview-row">
              <span className="payday-preview-period">Period 1 (1–15)</span>
              <span className="payday-preview-date">{format(payday1, 'EEE, MMM d')}</span>
            </div>
          )}
          <div className="payday-preview-row">
            <span className="payday-preview-period">{settings.paydayMode === 'semimonthly' ? 'Period 2 (16–End)' : 'Payday (End of Month)'}</span>
            <span className="payday-preview-date">{format(payday2, 'EEE, MMM d')}</span>
          </div>
        </div>

        {/* Holiday Manager */}
        <div className="space-y-2">
          <label className="form-label">Holidays (YYYY-MM-DD)</label>
          <div className="flex gap-1">
            <input type="text" className="form-control text-xs" value={holidayInput}
              onChange={(e) => setHolidayInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHoliday()}
              placeholder="e.g. 2026-08-21" maxLength={10} />
            <button className="btn btn-primary btn-xs flex-shrink-0"
              onClick={addHoliday} title="Add holiday" style={{ minWidth: '32px', minHeight: '32px' }}>
              <Plus size={14} />
            </button>
          </div>
          {settings.holidays.length > 0 && (
            <div className="holiday-tag-list">
              {settings.holidays.map(h => (
                <span key={h} className="holiday-tag">
                  {h}
                  <button className="holiday-tag-remove" onClick={() => removeHoliday(h)}><Minus size={10} /></button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted">Holidays shift paydays earlier per banking rules.</p>
        </div>

        {/* Google Calendar Sync */}
        <div className="space-y-2 pt-1 border-t border-border">
          <div className="card-header-title" style={{ marginBottom: '0.375rem' }}>
            <Key size={13} className="icon" /><span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>Google Calendar Sync</span>
          </div>
          <label className="form-label">API Key</label>
          <input type="password" className="form-control text-xs"
            value={settings.googleCalendarApiKey}
            onChange={(e) => onUpdateSettings({ ...settings, googleCalendarApiKey: e.target.value })}
            placeholder="AIza..." />
          <button
            className="btn btn-secondary btn-xs w-full flex items-center justify-center gap-1.5 font-semibold"
            onClick={handleSyncHolidays}
            disabled={!settings.googleCalendarApiKey || syncing}
          >
            <RefreshCw size={12} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing…' : `Sync PH Holidays ${previewYear}`}
          </button>
          {syncMsg && <p className="text-xs text-muted">{syncMsg}</p>}
          <p className="text-xs text-muted">
            Needs a Google Cloud API key with <strong>Calendar API</strong> enabled.{' '}
            <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Enable it here</a>.
          </p>
        </div>
      </div>

      {onResetAllData && (
        <button className="sidebar-reset-btn touch-target"
          onClick={() => {
            if (window.confirm('Delete all saved settings and logs? This cannot be undone.')) {
              onResetAllData();
            }
          }}>
          <Trash2 size={16} /> Reset &amp; Clear All Data
        </button>
      )}
    </aside>
  );
};

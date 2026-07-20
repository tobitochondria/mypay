import React from 'react';
import type { WorkSchedule } from '../../types';
import { CalendarRange } from 'lucide-react';

interface Props {
  schedule: WorkSchedule;
  onChange: (updated: WorkSchedule) => void;
}

const DAYS: { key: keyof WorkSchedule; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

export const SchedulePicker: React.FC<Props> = ({ schedule, onChange }) => {
  const toggleDay = (key: keyof WorkSchedule) => {
    onChange({
      ...schedule,
      [key]: !schedule[key]
    });
  };

  const selectPreset = (preset: 'mon-fri' | 'mon-sat' | 'all') => {
    if (preset === 'mon-fri') {
      onChange({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false });
    } else if (preset === 'mon-sat') {
      onChange({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false });
    } else {
      onChange({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true });
    }
  };

  const activeDaysCount = Object.values(schedule).filter(Boolean).length;

  return (
    <div className="sidebar-card">
      <div className="card-header">
        <div className="card-header-title">
          <CalendarRange className="icon icon-warning" size={18} />
          <span>Work Schedule</span>
        </div>
        <span className="badge badge-neutral">{activeDaysCount} days / week</span>
      </div>

      <div className="space-y-3 mt-2">
        <div className="day-picker-grid">
          {DAYS.map(({ key, short, label }) => {
            const isActive = !!schedule[key];
            return (
              <button
                key={key}
                type="button"
                className={`day-chip ${isActive ? 'active' : ''}`}
                onClick={() => toggleDay(key)}
                title={label}
              >
                {short}
              </button>
            );
          })}
        </div>

        <div className="schedule-presets">
          <button className="preset-btn" onClick={() => selectPreset('mon-fri')}>
            Mon-Fri
          </button>
          <button className="preset-btn" onClick={() => selectPreset('mon-sat')}>
            Mon-Sat
          </button>
          <button className="preset-btn" onClick={() => selectPreset('all')}>
            7 Days
          </button>
        </div>
      </div>
    </div>
  );
};

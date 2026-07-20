import React, { useState } from 'react';
import { isSameDay, getMonth, getYear } from 'date-fns';
import type { JobProfile, DailyLog, Holiday, PaydayStatus } from '../../types';
import { 
  getMonthCalendarDays, 
  getRawPaydayDates, 
  adjustPaydayDate, 
  formatDateKey 
} from '../../utils/dateUtils';
import type { PayPeriodFilter } from './CalendarHeader';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DayModal } from './DayModal';

interface Props {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  profile: JobProfile;
  logs: Record<string, DailyLog>;
  onSaveLog: (log: DailyLog) => void;
  onDeleteLog?: (dateStr: string) => void;
  autoHolidays: Holiday[];
  periodFilter: PayPeriodFilter;
  onFilterChange: (filter: PayPeriodFilter) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid: React.FC<Props> = ({
  currentDate,
  onCurrentDateChange,
  profile,
  logs,
  onSaveLog,
  onDeleteLog,
  autoHolidays,
  periodFilter,
  onFilterChange
}) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = getYear(currentDate);
  const month = getMonth(currentDate);

  // Combine auto-detected holidays + custom company holidays
  const allHolidays = [...autoHolidays, ...(profile.customHolidays || [])];

  // Raw payday target dates for this month
  const rawPaydayDates = getRawPaydayDates(year, month, profile.paymentFrequency);

  // Adjusted payday dates considering "On or Before Payday" weekend/holiday rule
  const adjustedPaydayDates = rawPaydayDates.map(raw => 
    adjustPaydayDate(raw, profile.paydayRule || 'on-or-before', allHolidays)
  );

  // Get calendar days for 7x5 or 7x6 month matrix
  const calendarDays = getMonthCalendarDays(year, month);

  // Filter days if period filter is selected (1st-15th or 16th-End)
  const filteredDays = calendarDays.filter(day => {
    if (periodFilter === 'all') return true;
    const dayNum = day.getDate();
    if (periodFilter === 'period-1') return dayNum <= 15;
    if (periodFilter === 'period-2') return dayNum >= 16;
    return true;
  });

  const handlePrevMonth = () => {
    onCurrentDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onCurrentDateChange(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    onCurrentDateChange(new Date());
  };

  // Helper to resolve payday info for a given date cell
  const getPaydayInfoForDate = (date: Date) => {
    const isRaw = rawPaydayDates.some(r => isSameDay(r, date));
    const isAdj = adjustedPaydayDates.some(a => isSameDay(a, date));

    const dateStr = formatDateKey(date);
    const log = logs[dateStr];
    const status: PaydayStatus = log?.paydayStatus || 'scheduled';

    return {
      isRawPayday: isRaw,
      isAdjustedPayday: isAdj,
      rawDate: rawPaydayDates[0],
      status
    };
  };

  return (
    <div id="tour-calendar-card" className="calendar-card">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        periodFilter={periodFilter}
        onFilterChange={onFilterChange}
        isSemiMonthly={profile.paymentFrequency === 'semi-monthly'}
      />

      <div className="calendar-grid-container">
        {/* Weekday Labels Header */}
        <div className="calendar-weekdays-grid mb-2">
          {WEEKDAYS.map((wd, i) => (
            <div key={wd} className={`weekday-col-header ${i === 0 || i === 6 ? 'weekend-header' : ''}`}>
              {wd.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="calendar-days-grid">
          {filteredDays.map(date => {
            const dateStr = formatDateKey(date);
            const log = logs[dateStr];
            const paydayInfo = getPaydayInfoForDate(date);

            return (
              <DayCell
                key={dateStr}
                date={date}
                currentMonthDate={currentDate}
                profile={profile}
                log={log}
                holidays={allHolidays}
                paydayInfo={paydayInfo}
                onClick={() => setSelectedDay(date)}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Edit Day Modal */}
      {selectedDay && (
        <DayModal
          date={selectedDay}
          profile={profile}
          log={logs[formatDateKey(selectedDay)]}
          holidays={allHolidays}
          isPayday={getPaydayInfoForDate(selectedDay).isAdjustedPayday}
          onSave={onSaveLog}
          onDeleteLog={onDeleteLog}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

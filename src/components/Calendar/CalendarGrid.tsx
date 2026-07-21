import React, { useState, useEffect } from 'react';
import { isSameDay, isSameMonth, isToday, format, getMonth, getYear } from 'date-fns';
import type { JobProfile, DailyLog, Holiday, PaydayStatus } from '../../types';
import { 
  getMonthCalendarDays, 
  getRawPaydayDates, 
  adjustPaydayDate, 
  formatDateKey,
  isScheduledWorkDay
} from '../../utils/dateUtils';
import { calculateDailyEarnings } from '../../utils/calculatePay';
import type { PayPeriodFilter, CalendarViewMode } from './CalendarHeader';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DayModal } from './DayModal';
import { DollarSign, CheckCircle2, Clock, Sparkles, ChevronRight } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => 
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'agenda' : 'grid'
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode !== 'agenda') {
        // Option to stay user choice or default
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

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

  // Days belonging strictly to current month for Agenda List View
  const agendaDays = filteredDays.filter(d => isSameMonth(d, currentDate));

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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Grid View Rendering */}
      {viewMode === 'grid' && (
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
      )}

      {/* Agenda List View Rendering (Mobile & Compact View) */}
      {viewMode === 'agenda' && (
        <div className="agenda-list-container">
          {agendaDays.map(date => {
            const dateStr = formatDateKey(date);
            const log = logs[dateStr];
            const paydayInfo = getPaydayInfoForDate(date);
            const isScheduled = isScheduledWorkDay(date, profile.workSchedule, profile.startDate, profile.endDate, allHolidays, profile.employmentType);
            const earnings = calculateDailyEarnings(date, log, profile, allHolidays);
            const status = log?.status || (isScheduled ? 'scheduled' : 'rest-day');
            const isTodayDate = isToday(date);
            const paydayStatus = log?.paydayStatus || paydayInfo.status || 'scheduled';

            return (
              <div
                key={dateStr}
                className={`agenda-day-card ${isTodayDate ? 'is-today' : ''}`}
                onClick={() => setSelectedDay(date)}
              >
                {/* Date Badge */}
                <div className="agenda-date-badge">
                  <span className="agenda-date-day">{format(date, 'EEE')}</span>
                  <span className="agenda-date-num">{format(date, 'd')}</span>
                </div>

                {/* Info & Status Badges */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Payday Pill */}
                    {paydayInfo.isAdjustedPayday && (
                      <span className={`payday-pill ${paydayStatus}`}>
                        <DollarSign size={10} />
                        <span>PAYDAY</span>
                        {paydayStatus === 'received' && <CheckCircle2 size={10} />}
                        {paydayStatus === 'delayed' && <Clock size={10} />}
                      </span>
                    )}

                    {/* Holiday Badge */}
                    {earnings.isHoliday && earnings.holidayInfo && (
                      <span className={`holiday-badge ${earnings.holidayInfo.type}`}>
                        <Sparkles size={10} />
                        <span className="truncate">{earnings.holidayInfo.name}</span>
                      </span>
                    )}

                    {/* Work Status Badge */}
                    {status === 'rendered' && <span className="badge badge-primary">Base Pay</span>}
                    {status === 'overtime' && <span className="badge badge-success">OT +{log?.overtimeHours}h</span>}
                    {status === 'undertime' && <span className="badge badge-warning">UT -{log?.undertimeHours}h</span>}
                    {status === 'paid-leave' && <span className="badge badge-purple">Paid Leave</span>}
                    {status === 'scheduled' && !log && <span className="badge badge-subtle">Scheduled</span>}
                    {status === 'absent' && <span className="badge badge-danger">Absent</span>}
                    {status === 'rest-day' && !isScheduled && <span className="text-xs text-muted italic">Day Off</span>}
                  </div>

                  <div className="text-xs text-muted">
                    {isTodayDate && <span className="text-primary font-bold mr-1">TODAY • </span>}
                    {format(date, 'MMMM d, yyyy')}
                  </div>
                </div>

                {/* Daily Earned Figure */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {earnings.totalDailyEarned > 0 ? (
                      <div className="font-extrabold text-sm text-success">
                        +{profile.currencySymbol}{earnings.totalDailyEarned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>
                    ) : (
                      <div className="text-xs text-muted">--</div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      )}

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


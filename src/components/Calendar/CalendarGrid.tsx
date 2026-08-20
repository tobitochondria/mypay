import React, { useState } from 'react';
import { isSameMonth, isToday, format, getMonth, getYear } from 'date-fns';
import type { AppSettings, DailyLog } from '../../types';
import { getMonthCalendarDays, formatDateKey, getActualPayday } from '../../utils/dateUtils';
import type { PayPeriodFilter, CalendarViewMode } from './CalendarHeader';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DayModal } from './DayModal';
import { ChevronRight, CreditCard, Sun, Plane, UserX } from 'lucide-react';

interface Props {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  logs: Record<string, DailyLog>;
  settings: AppSettings;
  onSaveLog: (log: DailyLog) => void;
  onDeleteLog?: (dateStr: string) => void;
  periodFilter: PayPeriodFilter;
  onFilterChange: (filter: PayPeriodFilter) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid: React.FC<Props> = ({
  currentDate,
  onCurrentDateChange,
  logs,
  settings,
  onSaveLog,
  onDeleteLog,
  periodFilter,
  onFilterChange
}) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'agenda' : 'grid'
  );

  const year = getYear(currentDate);
  const month = getMonth(currentDate);
  const { paydayMode, workdays, currencySymbol, dailyPayRate } = settings;

  const calendarDays = getMonthCalendarDays(year, month);

  // Compute actual payday dates for current month based on mode
  const paydayKeys = new Set<string>();
  const payday2 = getActualPayday(year, month, 'period-2', []);
  paydayKeys.add(formatDateKey(payday2));
  if (paydayMode === 'semimonthly') {
    const payday1 = getActualPayday(year, month, 'period-1', []);
    paydayKeys.add(formatDateKey(payday1));
  }

  // Active filter — in monthly mode period-1 is invalid
  const activeFilter = paydayMode === 'monthly' && periodFilter === 'period-1' ? 'all' : periodFilter;

  const filteredDays = calendarDays.filter(day => {
    if (activeFilter === 'all') return true;
    const dayNum = day.getDate();
    if (activeFilter === 'period-1') return dayNum <= 15;
    if (activeFilter === 'period-2') return dayNum >= 16;
    return true;
  });

  const agendaDays = filteredDays.filter(d => isSameMonth(d, currentDate));

  return (
    <div id="tour-calendar-card" className="calendar-card">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => onCurrentDateChange(new Date(year, month - 1, 1))}
        onNextMonth={() => onCurrentDateChange(new Date(year, month + 1, 1))}
        onToday={() => onCurrentDateChange(new Date())}
        periodFilter={periodFilter}
        onFilterChange={onFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        paydayMode={paydayMode}
      />

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="calendar-grid-container">
          <div className="calendar-weekdays-grid mb-2">
            {WEEKDAYS.map((wd, i) => (
              <div key={wd} className={`weekday-col-header ${i === 0 || i === 6 ? 'weekend-header' : ''} ${workdays.includes(i) ? 'workday-header' : ''}`}>
                {wd.toUpperCase()}
              </div>
            ))}
          </div>
          <div className="calendar-days-grid">
            {filteredDays.map(date => {
              const dateStr = formatDateKey(date);
              return (
                <DayCell
                  key={dateStr}
                  date={date}
                  currentMonthDate={currentDate}
                  log={logs[dateStr]}
                  currencySymbol={currencySymbol}
                  isWorkday={isSameMonth(date, currentDate) && workdays.includes(date.getDay())}
                  isPayday={paydayKeys.has(dateStr)}
                  onClick={() => setSelectedDay(date)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="agenda-list-container">
          {agendaDays.map(date => {
            const dateStr = formatDateKey(date);
            const log = logs[dateStr];
            const isTodayDate = isToday(date);
            const hasAmount = Boolean(log && log.amount > 0);
            const isPayday = paydayKeys.has(dateStr);
            const isWorkday = workdays.includes(date.getDay());
            const dayType = log?.dayType ?? 'work';

            return (
              <div
                key={dateStr}
                className={`agenda-day-card ${isTodayDate ? 'is-today' : ''} ${isPayday ? 'is-payday' : ''} ${isWorkday ? 'is-workday' : ''}`}
                onClick={() => setSelectedDay(date)}
              >
                <div className="agenda-date-badge">
                  <span className="agenda-date-day">{format(date, 'EEE')}</span>
                  <span className="agenda-date-num">{format(date, 'd')}</span>
                </div>

                <div className="flex-1 space-y-0.5">
                  {log?.notes && (
                    <div className="text-xs text-muted truncate">{log.notes}</div>
                  )}
                  <div className="text-xs text-muted flex items-center gap-1.5 flex-wrap">
                    {isTodayDate && <span className="text-primary font-bold">TODAY</span>}
                    {isPayday && <span className="agenda-payday-pill"><CreditCard size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Cutoff</span>}
                    {log && dayType === 'holiday' && <span className="agenda-holiday-pill"><Sun size={10} /> Holiday</span>}
                    {log && dayType === 'leave' && <span className="agenda-leave-pill"><Plane size={10} /> Leave</span>}
                    {log && dayType === 'absent' && <span className="agenda-absent-pill"><UserX size={10} /> Absent</span>}
                    {isWorkday && !isPayday && !log && <span className="agenda-workday-pill">Work</span>}
                    <span>{format(date, 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {hasAmount ? (
                      <div className="font-extrabold text-sm text-success">
                        +{currencySymbol}{log!.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
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

      {selectedDay && (
        <DayModal
          date={selectedDay}
          log={logs[formatDateKey(selectedDay)]}
          currencySymbol={currencySymbol}
          dailyPayRate={dailyPayRate}
          isWorkday={workdays.includes(selectedDay.getDay())}
          onSave={onSaveLog}
          onDeleteLog={onDeleteLog}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export type PayPeriodFilter = 'all' | 'period-1' | 'period-2';

interface Props {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  periodFilter: PayPeriodFilter;
  onFilterChange: (filter: PayPeriodFilter) => void;
  isSemiMonthly: boolean;
}

export const CalendarHeader: React.FC<Props> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  periodFilter,
  onFilterChange,
  isSemiMonthly
}) => {
  return (
    <div className="calendar-header-bar">
      <div className="flex items-center gap-3">
        <div className="month-display" style={{ minWidth: '180px' }}>
          <CalendarIcon className="icon-primary" size={22} />
          <h2 style={{ whiteSpace: 'nowrap' }}>{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        <div className="nav-buttons">
          <button className="btn-icon" onClick={onPrevMonth} title="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary btn-xs" onClick={onToday}>
            Today
          </button>
          <button className="btn-icon" onClick={onNextMonth} title="Next Month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="filter-segment">
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, padding: '0 0.375rem' }}>
          View:
        </span>
        <button
          className={`segment-btn ${periodFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          Full Month
        </button>
        {isSemiMonthly && (
          <>
            <button
              className={`segment-btn ${periodFilter === 'period-1' ? 'active' : ''}`}
              onClick={() => onFilterChange('period-1')}
            >
              1st - 15th
            </button>
            <button
              className={`segment-btn ${periodFilter === 'period-2' ? 'active' : ''}`}
              onClick={() => onFilterChange('period-2')}
            >
              16th - End
            </button>
          </>
        )}
      </div>
    </div>
  );
};

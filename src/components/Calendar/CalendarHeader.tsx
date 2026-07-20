import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';

export type PayPeriodFilter = 'all' | 'period-1' | 'period-2';
export type CalendarViewMode = 'grid' | 'agenda';

interface Props {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  periodFilter: PayPeriodFilter;
  onFilterChange: (filter: PayPeriodFilter) => void;
  isSemiMonthly: boolean;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

export const CalendarHeader: React.FC<Props> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  periodFilter,
  onFilterChange,
  isSemiMonthly,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="calendar-header-bar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 w-full border-b border-slate-100">
      {/* Left: View Mode Switcher */}
      <div className="flex items-center bg-surface-light border border-border p-0.5 rounded-md flex-shrink-0 self-start sm:self-auto">
        <button
          className={`btn-icon touch-target p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted'}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid View"
          style={{ minWidth: '36px', minHeight: '36px' }}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          className={`btn-icon touch-target p-1.5 rounded-sm ${viewMode === 'agenda' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted'}`}
          onClick={() => onViewModeChange('agenda')}
          title="Agenda List View"
          style={{ minWidth: '36px', minHeight: '36px' }}
        >
          <List size={16} />
        </button>
      </div>

      {/* Center: Month Title & Navigation Controls (Unified at Center) */}
      <div className="month-display flex items-center justify-center gap-2.5 sm:gap-3 sm:mx-auto flex-shrink-0">
        <CalendarIcon className="icon-primary flex-shrink-0" size={20} />
        <h2 className="text-base sm:text-xl font-bold text-slate-900 whitespace-nowrap">{format(currentDate, 'MMMM yyyy')}</h2>

        <div className="nav-buttons flex items-center gap-1 ml-1 sm:ml-2">
          <button className="btn-icon touch-target" onClick={onPrevMonth} title="Previous Month" style={{ minWidth: '34px', minHeight: '34px' }}>
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary btn-xs touch-target px-2.5 py-1" onClick={onToday} style={{ minHeight: '32px' }}>
            Today
          </button>
          <button className="btn-icon touch-target" onClick={onNextMonth} title="Next Month" style={{ minWidth: '34px', minHeight: '34px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Right: Pay Period Segmented Controller */}
      <div className="flex items-center gap-2 justify-end flex-shrink-0 self-end sm:self-auto">
        <div className="filter-segment hidden sm:flex items-center">
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, padding: '0 0.375rem' }}>
            Pay Period:
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

        <div className="sm:hidden flex-1 min-w-[110px]">
          <select
            className="form-control form-control-sm text-xs font-semibold py-1.5 px-2.5 w-full"
            value={periodFilter}
            onChange={(e) => onFilterChange(e.target.value as PayPeriodFilter)}
            style={{ minHeight: '36px' }}
          >
            <option value="all">Full Month</option>
            {isSemiMonthly && <option value="period-1">1st - 15th</option>}
            {isSemiMonthly && <option value="period-2">16th - End</option>}
          </select>
        </div>
      </div>
    </div>
  );
};



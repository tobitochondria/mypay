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
    <div className="calendar-header-bar flex flex-col sm:flex-row landscape:flex-row items-stretch sm:items-center landscape:items-center justify-between gap-2.5 p-3 sm:p-4 w-full">
      {/* Far Left: Month Title & Prev/Next/Today Navigation */}
      <div className="flex items-center justify-between sm:justify-start gap-2 flex-shrink-0">
        <div className="month-display flex items-center gap-2">
          <CalendarIcon className="icon-primary" size={20} />
          <h2 className="text-base sm:text-xl font-bold whitespace-nowrap">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        <div className="nav-buttons flex items-center gap-1">
          <button className="btn-icon touch-target" onClick={onPrevMonth} title="Previous Month" style={{ minWidth: '38px', minHeight: '38px' }}>
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary btn-xs touch-target px-2.5 py-1" onClick={onToday} style={{ minHeight: '34px' }}>
            Today
          </button>
          <button className="btn-icon touch-target" onClick={onNextMonth} title="Next Month" style={{ minWidth: '38px', minHeight: '38px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Far Right (or Row 2 on Portrait): Controls Row */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* List / Grid View Switcher */}
        <div className="flex items-center bg-surface-light border border-border p-0.5 rounded-md flex-shrink-0">
          <button
            className={`btn-icon touch-target p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted'}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            style={{ minWidth: '38px', minHeight: '38px' }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`btn-icon touch-target p-1.5 rounded-sm ${viewMode === 'agenda' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted'}`}
            onClick={() => onViewModeChange('agenda')}
            title="Agenda List View"
            style={{ minWidth: '38px', minHeight: '38px' }}
          >
            <List size={16} />
          </button>
        </div>

        {/* Segmented Tab Controls: Shown on Desktop, Tablet, and Mobile Landscape (Hidden on Mobile Portrait) */}
        <div className="filter-segment hidden sm:flex portrait:hidden landscape:flex items-center">
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

        {/* Compact Dropdown Selector: Shown on Mobile Portrait (<640px portrait), Hidden on Landscape & Desktop */}
        <div className="sm:hidden portrait:block landscape:hidden flex-1 min-w-[120px]">
          <select
            className="form-control form-control-sm text-xs font-semibold py-1.5 px-2.5 w-full"
            value={periodFilter}
            onChange={(e) => onFilterChange(e.target.value as PayPeriodFilter)}
            style={{ minHeight: '38px' }}
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



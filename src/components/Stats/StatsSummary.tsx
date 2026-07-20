import React, { useState } from 'react';
import type { JobProfile, DailyLog, Holiday } from '../../types';
import { calculatePaySummary } from '../../utils/calculatePay';
import { getMonthCalendarDays } from '../../utils/dateUtils';
import type { PayPeriodFilter } from '../Calendar/CalendarHeader';
import { getMonth, getYear } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Info, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  currentDate: Date;
  profile: JobProfile;
  logs: Record<string, DailyLog>;
  autoHolidays: Holiday[];
  periodFilter: PayPeriodFilter;
}

export const StatsSummary: React.FC<Props> = ({
  currentDate,
  profile,
  logs,
  autoHolidays,
  periodFilter
}) => {
  const [showItemized, setShowItemized] = useState(false);

  const year = getYear(currentDate);
  const month = getMonth(currentDate);

  const allHolidays = [...autoHolidays, ...(profile.customHolidays || [])];
  const allMonthDays = getMonthCalendarDays(year, month).filter(d => getMonth(d) === month);

  // Filter days based on view mode (Full month, 1st-15th, 16th-End)
  const filteredDays = allMonthDays.filter(day => {
    if (periodFilter === 'all') return true;
    const dayNum = day.getDate();
    if (periodFilter === 'period-1') return dayNum <= 15;
    if (periodFilter === 'period-2') return dayNum >= 16;
    return true;
  });

  const periodLabel = periodFilter === 'all' 
    ? 'Full Month Summary' 
    : periodFilter === 'period-1' 
      ? '1st - 15th Pay Period' 
      : '16th - End Pay Period';

  const summary = calculatePaySummary(
    filteredDays,
    logs,
    profile,
    allHolidays,
    periodLabel
  );

  const sym = profile.currencySymbol || '₱';

  return (
    <div id="tour-stats-summary" className="stats-summary-card w-full max-w-full box-border p-3.5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-border w-full">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="icon-success" />
          <h3 className="font-bold text-base tracking-tight">Earnings & Pay Summary</h3>
          <span className="badge badge-neutral text-xs">{periodLabel}</span>
        </div>
        <button
          className="btn-text btn-xs text-muted flex items-center gap-1 touch-target"
          onClick={() => setShowItemized(!showItemized)}
        >
          <Info size={13} /> {showItemized ? 'Hide Itemized Details' : 'View Itemized Breakdown'}
          {showItemized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
        {/* Net Take-Home Pay Card (Order 1 on Mobile, Order 3 on Desktop) */}
        <div className="stat-card stat-net p-3.5 sm:p-4 rounded-xl border bg-primary/10 border-primary/40 order-1 md:order-3 w-full box-border">
          <div className="stat-label text-xs font-semibold text-primary flex items-center justify-between">
            <span>Net Take-Home Pay</span>
            <span className="icon-badge icon-badge-success"><DollarSign size={14} /></span>
          </div>
          <div className="stat-value text-2xl sm:text-3xl font-extrabold text-success mt-1 text-fluid-stat truncate">
            {sym}{summary.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext text-xs text-success/80 mt-1">
            Gross Pay minus all taxes & deductions
          </div>
        </div>

        {/* Gross Pay Card (Order 2 on Mobile, Order 1 on Desktop) */}
        <div className="stat-card stat-gross p-3.5 sm:p-4 rounded-xl border bg-surface-dark order-2 md:order-1 w-full box-border">
          <div className="stat-label text-xs font-semibold text-muted flex items-center justify-between">
            <span>Gross Earnings</span>
            <span className="icon-badge icon-badge-primary"><DollarSign size={14} /></span>
          </div>
          <div className="stat-value text-xl sm:text-2xl font-bold text-primary mt-1 text-fluid-stat truncate">
            {sym}{summary.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext text-xs text-muted mt-1 truncate">
            Base: {sym}{summary.baseEarnings.toLocaleString()} {summary.overtimePay > 0 && `| OT: +${sym}${summary.overtimePay.toFixed(0)}`}
          </div>
        </div>

        {/* Total Deductions Card (Order 3 on Mobile, Order 2 on Desktop) */}
        <div className="stat-card stat-deductions p-3.5 sm:p-4 rounded-xl border bg-surface-dark order-3 md:order-2 w-full box-border">
          <div className="stat-label text-xs font-semibold text-muted flex items-center justify-between">
            <span>Total Deductions</span>
            <span className="icon-badge icon-badge-danger"><TrendingDown size={14} /></span>
          </div>
          <div className="stat-value text-xl sm:text-2xl font-bold text-danger mt-1 text-fluid-stat truncate">
            -{sym}{summary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext text-xs text-muted mt-1 truncate">
            Tax & {summary.itemizedDeductions.length > 1 ? `${summary.itemizedDeductions.length - 1} custom item(s)` : 'contributions'}
          </div>
        </div>

        {/* Total Days Rendered Card (Order 4 on Mobile, Order 4 on Desktop) */}
        <div className="stat-card stat-days p-3.5 sm:p-4 rounded-xl border bg-surface-dark order-4 md:order-4 w-full box-border">
          <div className="stat-label text-xs font-semibold text-muted flex items-center justify-between">
            <span>Total Days Rendered</span>
            <span className="icon-badge icon-badge-warning"><Calendar size={14} /></span>
          </div>
          <div className="stat-value text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">
            {summary.daysRendered} <span className="text-sm font-normal text-muted">/ {summary.scheduledDaysCount} days</span>
          </div>
          <div className="stat-subtext text-xs text-muted mt-1 truncate">
            Shift length: {profile.shiftLengthHours} hrs / day
          </div>
        </div>
      </div>

      {/* Expanded Itemized Breakdown Dropdown Panel */}
      {showItemized && (
        <div className="itemized-breakdown-panel mt-4 p-4 rounded-lg bg-surface-dark border space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Info size={14} className="text-primary" /> Itemized Pay Stub Breakdown ({periodLabel})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Earnings Breakdown */}
            <div className="space-y-1">
              <div className="font-bold text-muted uppercase pb-1 border-b border-border">Earnings Items</div>
              <div className="flex justify-between py-1">
                <span>Base Daily Wages ({summary.daysRendered} days)</span>
                <span className="font-semibold">{sym}{summary.baseEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Overtime Hours Pay</span>
                <span className="font-semibold text-success">+{sym}{summary.overtimePay.toFixed(2)}</span>
              </div>
              {summary.undertimeDeductions > 0 && (
                <div className="flex justify-between py-1 text-danger">
                  <span>Undertime Hours Deduction</span>
                  <span className="font-semibold">-{sym}{summary.undertimeDeductions.toFixed(2)}</span>
                </div>
              )}
              {summary.holidayBonusPay > 0 && (
                <div className="flex justify-between py-1 text-purple">
                  <span>Holiday Premium Bonus</span>
                  <span className="font-semibold">+{sym}{summary.holidayBonusPay.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold border-t border-border pt-1">
                <span>Total Gross Pay</span>
                <span>{sym}{summary.grossPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="space-y-1">
              <div className="font-bold text-muted uppercase pb-1 border-b border-border">Deductions Items</div>
              {summary.itemizedDeductions.length === 0 ? (
                <div className="text-muted py-1 italic">No deductions configured</div>
              ) : (
                summary.itemizedDeductions.map((ded) => (
                  <div key={ded.id} className="flex justify-between py-1 text-danger">
                    <span>{ded.name}</span>
                    <span className="font-semibold">-{sym}{ded.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between py-1 font-bold border-t border-border pt-1 text-danger">
                <span>Total Deductions</span>
                <span>-{sym}{summary.totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

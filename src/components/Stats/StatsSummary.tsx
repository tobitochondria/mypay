import React, { useState } from 'react';
import type { AppSettings, DailyLog } from '../../types';
import { calculatePeriodSummary } from '../../utils/calculatePay';
import { getMonthCalendarDays, getActualPayday, getPeriodKey, getNextPeriod } from '../../utils/dateUtils';
import type { PayPeriodFilter } from '../Calendar/CalendarHeader';
import { getMonth, getYear, format } from 'date-fns';
import { DollarSign, Calendar, TrendingUp, Banknote, ChevronRight } from 'lucide-react';
import { PaydayClaimModal } from './PaydayClaimModal';

interface Props {
  currentDate: Date;
  logs: Record<string, DailyLog>;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  periodFilter: PayPeriodFilter;
}

export const StatsSummary: React.FC<Props> = ({
  currentDate,
  logs,
  settings,
  onUpdateSettings,
  periodFilter
}) => {
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { currencySymbol, claimedPeriods, holidays } = settings;
  const sym = currencySymbol || '₱';
  const year = getYear(currentDate);
  const month = getMonth(currentDate);

  const allMonthDays = getMonthCalendarDays(year, month).filter(d => getMonth(d) === month);

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

  const summary = calculatePeriodSummary(filteredDays, logs, periodLabel);

  // Next payday info
  const today = new Date();
  const next = getNextPeriod(today, settings.paydayMode);
  const nextPeriodKey = getPeriodKey(next.year, next.month, next.period);
  const nextIsClaimed = claimedPeriods.includes(nextPeriodKey);
  const nextPayday = getActualPayday(next.year, next.month, next.period, holidays);
  const nextPeriodLabel = next.period === 'period-1' ? '1st–15th' : '16th–End';

  // Cumulative unclaimed: sum all logs whose period is NOT in claimedPeriods
  let cumulativeUnclaimed = 0;
  for (const [dateStr, log] of Object.entries(logs)) {
    if (!log.amount || log.amount <= 0) continue;
    const [y, m, d] = dateStr.split('-').map(Number);
    const monthIndex = m - 1;
    const period = d <= 15 ? 'period-1' : 'period-2';
    const key = getPeriodKey(y, monthIndex, period);
    if (!claimedPeriods.includes(key)) {
      cumulativeUnclaimed += log.amount;
    }
  }

  return (
    <div id="tour-stats-summary" className="stats-summary-card w-full max-w-full box-border p-3.5 sm:p-5 space-y-5">

      {/* ── Main Earnings Summary ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-border w-full">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="icon-success" />
            <h3 className="font-bold text-base tracking-tight">Earnings Summary</h3>
            <span className="badge badge-neutral text-xs">{periodLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full">
          {/* Total Earned */}
          <div className="stat-card stat-net p-3.5 sm:p-4 rounded-xl border bg-primary/10 border-primary/40 w-full box-border">
            <div className="stat-label text-xs font-semibold text-primary flex items-center justify-between">
              <span>Total Earned</span>
              <span className="icon-badge icon-badge-success"><DollarSign size={14} /></span>
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-extrabold text-success mt-1 truncate">
              {sym}{summary.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-subtext text-xs text-success/80 mt-1">
              Sum of all manually logged daily earnings
            </div>
          </div>

          {/* Days Logged */}
          <div className="stat-card stat-days p-3.5 sm:p-4 rounded-xl border bg-surface-dark w-full box-border">
            <div className="stat-label text-xs font-semibold text-muted flex items-center justify-between">
              <span>Days Logged</span>
              <span className="icon-badge icon-badge-warning"><Calendar size={14} /></span>
            </div>
            <div className="stat-value text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">
              {summary.daysLogged} <span className="text-sm font-normal text-muted">/ {filteredDays.length} days</span>
            </div>
            <div className="stat-subtext text-xs text-muted mt-1 truncate">
              Days in this period with a logged amount
            </div>
          </div>

          {/* Average per Day */}
          <div className="stat-card stat-gross p-3.5 sm:p-4 rounded-xl border bg-surface-dark w-full box-border">
            <div className="stat-label text-xs font-semibold text-muted flex items-center justify-between">
              <span>Average per Logged Day</span>
              <span className="icon-badge icon-badge-primary"><DollarSign size={14} /></span>
            </div>
            <div className="stat-value text-xl sm:text-2xl font-bold text-primary mt-1 truncate">
              {sym}{summary.averagePerDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-subtext text-xs text-muted mt-1 truncate">
              Total earned ÷ days logged
            </div>
          </div>
        </div>
      </div>

      {/* ── Estimated Gross Salary (clickable → modal) ── */}
      <button
        className="estimated-gross-card w-full text-left"
        onClick={() => setShowClaimModal(true)}
        title="Click to manage payday claims"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="icon-primary" />
            <h3 className="font-bold text-base tracking-tight">Estimated Gross Salary</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="badge badge-primary text-xs">Next Payday</span>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        <div className={`text-3xl font-extrabold mb-1 ${cumulativeUnclaimed === 0 ? 'text-muted' : 'text-primary'}`}>
          {sym}{cumulativeUnclaimed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <p className="text-xs text-muted">
          {nextIsClaimed
            ? `Next period (${nextPeriodLabel}) claimed — tap to manage`
            : `Cumulative unclaimed · Next payday ${format(nextPayday, 'EEE, MMM d, yyyy')}`}
        </p>
      </button>

      {/* Payday Claim Modal */}
      {showClaimModal && (
        <PaydayClaimModal
          logs={logs}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
};

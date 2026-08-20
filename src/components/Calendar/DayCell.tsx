import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import type { DailyLog } from '../../types';
import { Briefcase } from 'lucide-react';

interface Props {
  date: Date;
  currentMonthDate: Date;
  log: DailyLog | undefined;
  currencySymbol: string;
  isWorkday: boolean;
  isPayday: boolean;
  onClick: () => void;
}

export const DayCell: React.FC<Props> = ({
  date,
  currentMonthDate,
  log,
  currencySymbol,
  isWorkday,
  isPayday,
  onClick
}) => {
  const isCurrentMonth = isSameMonth(date, currentMonthDate);
  const isCurrentDay = isToday(date);
  const hasAmount = Boolean(log && log.amount > 0);
  const showWorkday = isWorkday && isCurrentMonth;
  const showPayday = isPayday && isCurrentMonth;

  return (
    <div
      className={[
        'day-cell',
        !isCurrentMonth ? 'other-month' : '',
        isCurrentDay ? 'today' : '',
        hasAmount ? 'logged-day' : '',
        showWorkday ? 'workday-cell' : '',
        showPayday ? 'payday-cell' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {/* Payday banner — shown at very top, above everything */}
      {showPayday && (
        <div className="payday-banner">💰 Payday</div>
      )}

      <div className="day-cell-header flex justify-between items-center mb-1">
        <span className={`day-number ${isCurrentDay ? 'today-badge' : ''}`}>
          {format(date, 'd')}
        </span>
        {showWorkday && !showPayday && (
          <Briefcase size={10} className="workday-icon" strokeWidth={2.5} />
        )}
      </div>

      <div className="day-cell-content space-y-1">
        {log?.notes && (
          <span className="text-xs text-muted truncate desktop-only block" title={log.notes}>
            {log.notes}
          </span>
        )}
      </div>

      <div className="day-cell-footer mt-auto pt-1 flex justify-between items-center">
        {hasAmount ? (
          <span className="daily-earned-badge text-xs sm:text-sm font-extrabold">
            +{currencySymbol}{log!.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-xs text-muted">--</span>
        )}
      </div>
    </div>
  );
};

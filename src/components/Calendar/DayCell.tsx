import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import type { JobProfile, DailyLog, Holiday, PaydayStatus } from '../../types';
import { calculateDailyEarnings } from '../../utils/calculatePay';
import { isScheduledWorkDay } from '../../utils/dateUtils';
import { CheckCircle2, Clock, DollarSign, Sparkles } from 'lucide-react';

interface Props {
  date: Date;
  currentMonthDate: Date;
  profile: JobProfile;
  log: DailyLog | undefined;
  holidays: Holiday[];
  paydayInfo?: {
    isRawPayday: boolean;
    isAdjustedPayday: boolean;
    rawDate: Date;
    status: PaydayStatus;
  };
  onClick: () => void;
}

export const DayCell: React.FC<Props> = ({
  date,
  currentMonthDate,
  profile,
  log,
  holidays,
  paydayInfo,
  onClick
}) => {
  const isCurrentMonth = isSameMonth(date, currentMonthDate);
  const isCurrentDay = isToday(date);
  const isScheduled = isScheduledWorkDay(date, profile.workSchedule, profile.startDate, profile.endDate);

  const earnings = calculateDailyEarnings(date, log, profile, holidays);

  const status = log?.status || (isScheduled ? 'scheduled' : 'rest-day');
  const otHours = log?.overtimeHours || 0;
  const utHours = log?.undertimeHours || 0;

  const paydayStatus = log?.paydayStatus || paydayInfo?.status || 'scheduled';

  return (
    <div
      className={`day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isScheduled ? 'scheduled-day' : 'rest-day-cell'}`}
      onClick={onClick}
    >
      <div className="day-cell-header flex justify-between items-center mb-1">
        <span className={`day-number ${isCurrentDay ? 'today-badge' : ''}`}>
          {format(date, 'd')}
        </span>

        {/* Payday Badge */}
        {paydayInfo?.isAdjustedPayday && (
          <div className={`payday-pill ${paydayStatus}`} title={`Pay Day (${paydayStatus.toUpperCase()})`}>
            <DollarSign size={11} />
            <span>PAYDAY</span>
            {paydayStatus === 'received' && <CheckCircle2 size={10} className="ml-1" />}
            {paydayStatus === 'delayed' && <Clock size={10} className="ml-1" />}
          </div>
        )}

        {!paydayInfo?.isAdjustedPayday && paydayInfo?.isRawPayday && (
          <span className="payday-shifted-indicator" title="Shifted due to weekend/holiday">
            Payday Shifted
          </span>
        )}
      </div>

      <div className="day-cell-content space-y-1">
        {/* Holiday Badge */}
        {earnings.isHoliday && earnings.holidayInfo && (
          <div className={`holiday-badge ${earnings.holidayInfo.type}`}>
            <Sparkles size={10} />
            <span className="truncate">{earnings.holidayInfo.name}</span>
          </div>
        )}

        {/* Work Status Badges */}
        {status === 'overtime' && (
          <span className="badge badge-success text-xs">
            OT +{otHours}h
          </span>
        )}

        {status === 'undertime' && (
          <span className="badge badge-warning text-xs">
            UT -{utHours}h
          </span>
        )}

        {status === 'rendered' && (
          <span className="badge badge-primary text-xs">
            Base Pay
          </span>
        )}

        {status === 'paid-leave' && (
          <span className="badge badge-purple text-xs">
            Paid Leave
          </span>
        )}

        {status === 'scheduled' && !log && (
          <span className="badge badge-subtle text-xs">
            Scheduled
          </span>
        )}

        {status === 'absent' && (
          <span className="badge badge-danger text-xs">
            Absent
          </span>
        )}

        {status === 'rest-day' && !isScheduled && (
          <span className="text-muted text-xs italic">
            Off
          </span>
        )}
      </div>

      <div className="day-cell-footer mt-auto pt-1 flex justify-between items-center">
        {earnings.totalDailyEarned > 0 ? (
          <span className="daily-earned-badge">
            +{profile.currencySymbol}{earnings.totalDailyEarned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-xs text-muted">--</span>
        )}
      </div>
    </div>
  );
};

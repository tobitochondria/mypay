import React, { useState } from 'react';
import { format } from 'date-fns';
import type { DailyLog, DayType } from '../../types';
import { formatDateKey } from '../../utils/dateUtils';
import { X, Check, FileText, RotateCcw, Briefcase, Sun, Plane, UserX } from 'lucide-react';

interface Props {
  date: Date;
  log: DailyLog | undefined;
  currencySymbol: string;
  dailyPayRate: number;
  isWorkday: boolean;
  onSave: (updatedLog: DailyLog) => void;
  onDeleteLog?: (dateStr: string) => void;
  onClose: () => void;
}

const DAY_TYPES: { value: DayType; label: string; icon: React.ReactNode }[] = [
  { value: 'work', label: 'Work', icon: <Briefcase size={13} /> },
  { value: 'holiday', label: 'Holiday', icon: <Sun size={13} /> },
  { value: 'leave', label: 'Leave', icon: <Plane size={13} /> },
  { value: 'absent', label: 'Absent', icon: <UserX size={13} /> },
];

export const DayModal: React.FC<Props> = ({
  date,
  log,
  currencySymbol,
  dailyPayRate,
  isWorkday,
  onSave,
  onDeleteLog,
  onClose,
}) => {
  const dateStr = formatDateKey(date);

  const defaultAmount = !log && isWorkday && dailyPayRate > 0 ? String(dailyPayRate) : '';
  const [dayType, setDayType] = useState<DayType>(log?.dayType ?? 'work');
  const [amount, setAmount] = useState<string>(
    log?.amount !== undefined ? String(log.amount) : defaultAmount
  );
  const [notes, setNotes] = useState<string>(log?.notes || '');

  const isLogged = log !== undefined;
  const isAbsent = dayType === 'absent';

  const handleTypeChange = (type: DayType) => {
    setDayType(type);
    if (type === 'absent') {
      setAmount('0');
    } else {
      // Restore a sensible default when switching away from absent
      setAmount(prev => (prev === '0' && defaultAmount ? defaultAmount : prev));
    }
  };

  const handleSave = () => {
    const parsedAmount = isAbsent ? 0 : Math.max(0, parseFloat(amount) || 0);
    onSave({ date: dateStr, amount: parsedAmount, notes, dayType });
    onClose();
  };

  const handleUndo = () => {
    onDeleteLog?.(dateStr);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container day-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex justify-between items-center pb-3 border-b border-border">
          <h3 className="text-lg font-bold">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4 py-4">

          {/* Day Type Toggle */}
          <div>
            <label className="form-label mb-1.5">Day Type</label>
            <div className="day-type-toggle-group">
              {DAY_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`day-type-btn day-type-btn--${value} ${dayType === value ? 'active' : ''}`}
                  onClick={() => handleTypeChange(value)}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Earned Input — hidden for Absent */}
          {!isAbsent && (
            <div>
              <label className="form-label">Amount Earned</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  autoFocus={!isAbsent}
                  className="form-control font-bold text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {!isLogged && isWorkday && dailyPayRate > 0 && dayType === 'work' && (
                <p className="text-xs text-muted mt-1">Pre-filled with your default daily pay rate.</p>
              )}
            </div>
          )}

          {isAbsent && (
            <p className="text-xs text-muted bg-surface-dark rounded-lg px-3 py-2">
              Absent days are recorded as <strong>zero pay</strong>.
            </p>
          )}

          {/* Notes Input */}
          <div>
            <label className="form-label flex items-center gap-1">
              <FileText size={14} /> Notes (optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                dayType === 'holiday' ? 'e.g. National Heroes Day' :
                  dayType === 'leave' ? 'e.g. Sick leave, vacation' :
                    dayType === 'absent' ? 'e.g. Reason for absence' :
                      'e.g. Freelance project, side gig'
              }
            />
          </div>
        </div>

        <div className="modal-footer flex justify-between items-center pt-3 border-t border-border">
          {isLogged ? (
            <button
              className="btn btn-ghost btn-sm text-danger flex items-center gap-1.5 font-semibold"
              onClick={handleUndo}
              title="Clear the logged entry for this date"
            >
              <RotateCcw size={14} /> Clear Log
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

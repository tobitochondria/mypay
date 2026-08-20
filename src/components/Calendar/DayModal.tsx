import React, { useState } from 'react';
import { format } from 'date-fns';
import type { DailyLog } from '../../types';
import { formatDateKey } from '../../utils/dateUtils';
import { X, Check, FileText, RotateCcw } from 'lucide-react';

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

export const DayModal: React.FC<Props> = ({
  date,
  log,
  currencySymbol,
  dailyPayRate,
  isWorkday,
  onSave,
  onDeleteLog,
  onClose
}) => {
  const dateStr = formatDateKey(date);

  // Pre-fill with dailyPayRate if no log exists and it's a workday
  const defaultAmount = !log && isWorkday && dailyPayRate > 0 ? String(dailyPayRate) : '';
  const [amount, setAmount] = useState<string>(log?.amount !== undefined ? String(log.amount) : defaultAmount);
  const [notes, setNotes] = useState<string>(log?.notes || '');

  const isLogged = log !== undefined;

  const handleSave = () => {
    const parsedAmount = Math.max(0, parseFloat(amount) || 0);
    onSave({ date: dateStr, amount: parsedAmount, notes });
    onClose();
  };

  const handleUndo = () => {
    onDeleteLog?.(dateStr);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container day-modal-card">
        <div className="modal-header flex justify-between items-center pb-3 border-b border-border">
          <h3 className="text-lg font-bold">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4 py-4">
          {/* Amount Earned Input */}
          <div>
            <label className="form-label">Amount Earned</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                className="form-control font-bold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {!isLogged && isWorkday && dailyPayRate > 0 && (
              <p className="text-xs text-muted mt-1">Pre-filled with your default daily pay rate.</p>
            )}
          </div>

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
              placeholder="e.g. Freelance project, side gig"
            />
          </div>
        </div>

        <div className="modal-footer flex justify-between items-center pt-3 border-t border-border">
          {isLogged ? (
            <button
              className="btn btn-ghost btn-sm text-danger flex items-center gap-1.5 font-semibold"
              onClick={handleUndo}
              title="Clear the logged amount for this date"
            >
              <RotateCcw size={14} /> Clear Log
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

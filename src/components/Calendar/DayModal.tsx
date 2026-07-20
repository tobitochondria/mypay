import React, { useState } from 'react';
import { format } from 'date-fns';
import type { JobProfile, DailyLog, Holiday, DayWorkStatus, PaydayStatus } from '../../types';
import { calculateDailyEarnings } from '../../utils/calculatePay';
import { isScheduledWorkDay, formatDateKey } from '../../utils/dateUtils';
import { X, Check, DollarSign, FileText, Plus, Minus, Edit3, RotateCcw } from 'lucide-react';

interface Props {
  date: Date;
  profile: JobProfile;
  log: DailyLog | undefined;
  holidays: Holiday[];
  isPayday: boolean;
  onSave: (updatedLog: DailyLog) => void;
  onDeleteLog?: (dateStr: string) => void;
  onClose: () => void;
}

export const DayModal: React.FC<Props> = ({
  date,
  profile,
  log,
  holidays,
  isPayday,
  onSave,
  onDeleteLog,
  onClose
}) => {
  const dateStr = formatDateKey(date);
  const isScheduled = isScheduledWorkDay(date, profile.workSchedule, profile.startDate, profile.endDate);

  const [status, setStatus] = useState<DayWorkStatus>(
    log?.status || (isScheduled ? 'rendered' : 'rest-day')
  );
  const [otHours, setOtHours] = useState<number>(log?.overtimeHours || 0);
  const [utHours, setUtHours] = useState<number>(log?.undertimeHours || 0);
  const [customEarned, setCustomEarned] = useState<string>(
    log?.customEarnings !== undefined ? String(log.customEarnings) : ''
  );
  const [payStatus, setPayStatus] = useState<PaydayStatus>(log?.paydayStatus || 'scheduled');
  const [notes, setNotes] = useState<string>(log?.notes || '');

  const customEarnedVal = customEarned !== '' ? (parseFloat(customEarned) || 0) : undefined;

  // Live earnings calculation preview
  const mockLog: DailyLog = {
    date: dateStr,
    status,
    overtimeHours: otHours,
    undertimeHours: utHours,
    customEarnings: customEarnedVal,
    notes,
    paydayStatus: payStatus
  };

  const preview = calculateDailyEarnings(date, mockLog, profile, holidays);

  const handleSave = () => {
    onSave(mockLog);
    onClose();
  };

  const handleUndo = () => {
    if (onDeleteLog) {
      onDeleteLog(dateStr);
    }
    onClose();
  };

  const isLogged = log !== undefined;

  return (
    <div className="modal-backdrop">
      <div className="modal-container day-modal-card">
        <div className="modal-header flex justify-between items-center pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h3>
            <span className="text-xs text-muted flex items-center gap-1">
              {isScheduled ? 'Scheduled Work Day' : 'Rest Day'} 
              {preview.isHoliday && (
                <span className="badge badge-purple ml-2">{preview.holidayInfo?.name}</span>
              )}
            </span>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4 py-4">
          {/* Work Status Selection */}
          <div>
            <label className="form-label">Day Work Status</label>
            <div className="status-grid-selector">
              <button
                type="button"
                className={`status-chip ${status === 'rendered' ? 'active status-rendered' : ''}`}
                onClick={() => setStatus('rendered')}
              >
                Base Pay (Full Shift)
              </button>
              <button
                type="button"
                className={`status-chip ${status === 'paid-leave' ? 'active status-paid-leave' : ''}`}
                onClick={() => setStatus('paid-leave')}
              >
                Paid Leave (SL / VL)
              </button>
              <button
                type="button"
                className={`status-chip ${status === 'absent' ? 'active status-absent' : ''}`}
                onClick={() => setStatus('absent')}
              >
                Absent / Unpaid
              </button>
              <button
                type="button"
                className={`status-chip ${status === 'rest-day' ? 'active status-rest' : ''}`}
                onClick={() => setStatus('rest-day')}
              >
                Rest Day Off
              </button>
            </div>
          </div>

          {/* Overtime & Undertime Inputs */}
          {(status === 'overtime' || status === 'rendered' || status === 'paid-leave') && (
            <div className="bg-surface-dark p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between w-full">
                <span className="form-label mb-0">Overtime Hours</span>
                <span className="text-xs font-semibold text-success">
                  +{profile.currencySymbol}{((profile.dailyRate / (profile.shiftLengthHours || 1)) * otHours * (profile.otMultiplier || 1.25)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="btn-icon btn-secondary btn-sm" 
                  onClick={() => setOtHours(Math.max(0, otHours - 0.5))}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-control text-center font-bold"
                  value={otHours}
                  onChange={(e) => setOtHours(Math.max(0, parseFloat(e.target.value) || 0))}
                />
                <button 
                  className="btn-icon btn-secondary btn-sm" 
                  onClick={() => setOtHours(otHours + 0.5)}
                >
                  <Plus size={14} />
                </button>
                <span className="text-sm font-semibold">hours</span>
              </div>
            </div>
          )}

          {(status === 'undertime' || status === 'rendered') && (
            <div className="bg-surface-dark p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between w-full">
                <span className="form-label mb-0">Undertime Hours</span>
                <span className="text-xs font-semibold text-danger">
                  -{profile.currencySymbol}{((profile.dailyRate / (profile.shiftLengthHours || 1)) * utHours).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="btn-icon btn-secondary btn-sm" 
                  onClick={() => setUtHours(Math.max(0, utHours - 0.5))}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-control text-center font-bold"
                  value={utHours}
                  onChange={(e) => setUtHours(Math.max(0, parseFloat(e.target.value) || 0))}
                />
                <button 
                  className="btn-icon btn-secondary btn-sm" 
                  onClick={() => setUtHours(utHours + 0.5)}
                >
                  <Plus size={14} />
                </button>
                <span className="text-sm font-semibold">hours</span>
              </div>
            </div>
          )}

          {/* Manual Earned Income Override Input */}
          <div className="bg-surface-dark p-3 rounded-lg space-y-2 border border-border">
            <div className="flex items-center justify-between">
              <label className="form-label mb-0 flex items-center gap-1">
                <Edit3 size={13} className="text-primary" /> Manual Earned Income (Override)
              </label>
              {customEarned !== '' && (
                <button
                  type="button"
                  className="btn-text btn-xs text-muted"
                  onClick={() => setCustomEarned('')}
                >
                  Reset to Auto-Calculate
                </button>
              )}
            </div>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">{profile.currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control font-bold"
                value={customEarned}
                onChange={(e) => setCustomEarned(e.target.value)}
                placeholder="Type manual earned income amount..."
              />
            </div>
            <p className="text-xs text-muted">
              {customEarned !== ''
                ? `Manual override active. Replaces auto-calculation with ${profile.currencySymbol}${parseFloat(customEarned) || 0}.`
                : 'Type a custom amount here to completely override the earned income for this date.'}
            </p>
          </div>

          {/* Payday Status Options if this date is a payday */}
          {isPayday && (
            <div className="bg-glass-card p-3 rounded-lg space-y-2 border border-primary/30">
              <label className="form-label flex items-center gap-1 font-bold text-primary">
                <DollarSign size={16} /> Payday Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`btn btn-xs ${payStatus === 'received' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setPayStatus('received')}
                >
                  Received
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${payStatus === 'early' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPayStatus('early')}
                >
                  Early
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${payStatus === 'delayed' ? 'btn-warning' : 'btn-secondary'}`}
                  onClick={() => setPayStatus('delayed')}
                >
                  Delayed
                </button>
              </div>
              {payStatus === 'delayed' && (
                <p className="text-xs text-warning mt-1">
                  * Marking as delayed shifts target payment date to the next available weekday.
                </p>
              )}
            </div>
          )}

          {/* Notes Input */}
          <div>
            <label className="form-label flex items-center gap-1">
              <FileText size={14} /> Daily Notes / Comments
            </label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Project deployment OT, client meeting"
            />
          </div>

          {/* Daily Preview Box */}
          <div className="daily-preview-box flex justify-between items-center p-3 bg-surface-dark rounded-lg border">
            <div>
              <span className="text-xs text-muted block">Total Daily Earned</span>
              <span className="text-xl font-bold text-success">
                {profile.currencySymbol}{preview.totalDailyEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right text-xs text-muted">
              {customEarnedVal !== undefined ? (
                <div className="text-primary font-semibold">Manual Override</div>
              ) : (
                <>
                  <div>Base: {profile.currencySymbol}{preview.baseEarned}</div>
                  {preview.overtimeEarned > 0 && <div>OT: +{profile.currencySymbol}{preview.overtimeEarned.toFixed(2)}</div>}
                  {preview.undertimeDeduction > 0 && <div>UT: -{profile.currencySymbol}{preview.undertimeDeduction.toFixed(2)}</div>}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer flex justify-between items-center pt-3 border-t border-border">
          {isLogged ? (
            <button 
              className="btn btn-ghost btn-sm text-danger flex items-center gap-1.5 font-semibold" 
              onClick={handleUndo}
              title="Revert this day to its unedited default schedule"
            >
              <RotateCcw size={14} /> Undo Logged Day
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={16} /> Save Day Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

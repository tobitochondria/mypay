import React from 'react';
import type { AppSettings, DailyLog } from '../../types';
import { getMonthCalendarDays, getActualPayday, getPeriodKey } from '../../utils/dateUtils';
import { calculatePeriodSummary } from '../../utils/calculatePay';
import { format, getMonth } from 'date-fns';
import { X, CheckCircle2, RotateCcw, CreditCard } from 'lucide-react';

interface PaydayPeriodRow {
    key: string;       // e.g. "2026-08-period-1"
    year: number;
    month: number;     // 0-indexed
    period: 'period-1' | 'period-2';
    label: string;     // e.g. "August 2026 · 1st–15th"
    paydayDate: Date;
    totalEarned: number;
    isClaimed: boolean;
}

interface Props {
    logs: Record<string, DailyLog>;
    settings: AppSettings;
    onUpdateSettings: (s: AppSettings) => void;
    onClose: () => void;
}

export const PaydayClaimModal: React.FC<Props> = ({
    logs,
    settings,
    onUpdateSettings,
    onClose,
}) => {
    const { claimedPeriods, currencySymbol } = settings;
    const sym = currencySymbol || '₱';

    // Build set of all month+period combos that have any logged earnings
    const activePeriodKeys = new Set<string>();

    // Always include current month's periods
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    activePeriodKeys.add(getPeriodKey(nowYear, nowMonth, 'period-1'));
    activePeriodKeys.add(getPeriodKey(nowYear, nowMonth, 'period-2'));

    // Include any period that has a logged amount
    for (const [dateStr] of Object.entries(logs)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const monthIndex = m - 1;
        const period = d <= 15 ? 'period-1' : 'period-2';
        activePeriodKeys.add(getPeriodKey(y, monthIndex, period));
    }

    // Also include any period that was previously claimed (so user can undo)
    for (const key of claimedPeriods) {
        activePeriodKeys.add(key);
    }

    // Build rows for each active period
    const rows: PaydayPeriodRow[] = [];
    for (const key of activePeriodKeys) {
        // key format: "YYYY-MM-period-X"
        const parts = key.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // back to 0-indexed
        const period = `${parts[2]}-${parts[3]}` as 'period-1' | 'period-2';
        const periodShort = period === 'period-1' ? '1st–15th' : '16th–End';
        const monthDays = getMonthCalendarDays(year, month).filter(d => getMonth(d) === month);
        const periodDays = monthDays.filter(d =>
            period === 'period-1' ? d.getDate() <= 15 : d.getDate() >= 16
        );
        const { totalEarned } = calculatePeriodSummary(periodDays, logs, '', settings.workdays);
        const paydayDate = getActualPayday(year, month, period, []);

        rows.push({
            key,
            year,
            month,
            period,
            label: `${format(new Date(year, month, 1), 'MMMM yyyy')} · ${periodShort}`,
            paydayDate,
            totalEarned,
            isClaimed: claimedPeriods.includes(key),
        });
    }

    // Sort: most recent first
    rows.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        if (b.month !== a.month) return b.month - a.month;
        return b.period === 'period-2' ? 1 : -1;
    });

    const toggleClaim = (key: string) => {
        const updated = claimedPeriods.includes(key)
            ? claimedPeriods.filter(k => k !== key)
            : [...claimedPeriods, key];
        onUpdateSettings({ ...settings, claimedPeriods: updated });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-container payday-claim-modal-card"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header flex justify-between items-center pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <CreditCard size={20} className="icon-primary" />
                        <h3 className="text-lg font-bold">Cutoff Claims</h3>
                    </div>
                    <button className="btn-icon btn-ghost" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body py-4 space-y-2 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    <p className="text-xs text-muted mb-3">
                        Mark pay periods as claimed once you've received the payout. Claimed periods are excluded from your estimated gross.
                    </p>

                    {rows.map(row => (
                        <div
                            key={row.key}
                            className={`payday-claim-row ${row.isClaimed ? 'is-claimed' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-bold truncate">{row.label}</span>
                                    {row.isClaimed && (
                                        <span className="badge badge-success text-xs flex-shrink-0">Claimed</span>
                                    )}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    Cutoff Date: {format(row.paydayDate, 'EEE, MMM d, yyyy')}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-sm font-extrabold ${row.isClaimed ? 'text-muted line-through' : 'text-success'}`}>
                                    {sym}{row.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <button
                                    className={`btn btn-xs flex items-center gap-1 font-semibold ${row.isClaimed ? 'btn-secondary' : 'btn-success'}`}
                                    onClick={() => toggleClaim(row.key)}
                                    style={{ minWidth: '80px' }}
                                >
                                    {row.isClaimed
                                        ? <><RotateCcw size={11} /> Undo</>
                                        : <><CheckCircle2 size={11} /> Claim</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="modal-footer flex justify-end pt-3 border-t border-border">
                    <button className="btn btn-secondary" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

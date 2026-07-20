import React, { useRef } from 'react';
import type { JobProfile, DailyLog, Holiday } from '../../types';
import { calculateDailyEarnings, calculatePaySummary } from '../../utils/calculatePay';
import { getMonthCalendarDays, formatDateKey } from '../../utils/dateUtils';
import { getStoredLogs } from '../../utils/storage';
import { getMonth, getYear, format } from 'date-fns';
import { Download, FileSpreadsheet, FileJson, Upload, X, Trash2 } from 'lucide-react';

interface Props {
  currentDate: Date;
  profile: JobProfile;
  profiles: JobProfile[];
  logs: Record<string, DailyLog>;
  autoHolidays: Holiday[];
  onImportData: (data: { profiles: JobProfile[]; allProfileLogs: Record<string, Record<string, DailyLog>> }) => void;
  onResetAllData?: () => void;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({
  currentDate,
  profile,
  profiles,
  logs,
  autoHolidays,
  onImportData,
  onResetAllData,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const year = getYear(currentDate);
  const month = getMonth(currentDate);
  const monthLabel = format(currentDate, 'MMMM yyyy');
  const allHolidays = [...autoHolidays, ...(profile.customHolidays || [])];
  const monthDays = getMonthCalendarDays(year, month).filter(d => getMonth(d) === month);

  const summary = calculatePaySummary(
    monthDays,
    logs,
    profile,
    allHolidays,
    `Full Month - ${monthLabel}`
  );

  // Export to CSV
  const handleExportCSV = () => {
    const sym = profile.currencySymbol || '₱';
    const rows = [
      ['MYPAY WORK LOG & PAYROLL REPORT'],
      [`Profile: ${profile.title} (${profile.company})`],
      [`Period: ${monthLabel}`],
      [`Currency: ${sym}`],
      [''],
      ['Date', 'Day', 'Status', 'Base Pay', 'OT Hours', 'OT Pay', 'UT Hours', 'UT Deduction', 'Holiday Bonus', 'Total Daily Earned', 'Notes'],
    ];

    monthDays.forEach(date => {
      const dateStr = formatDateKey(date);
      const log = logs[dateStr];
      const details = calculateDailyEarnings(date, log, profile, allHolidays);
      const status = log?.status || 'scheduled';

      rows.push([
        dateStr,
        format(date, 'EEEE'),
        status,
        details.baseEarned.toFixed(2),
        (log?.overtimeHours || 0).toString(),
        details.overtimeEarned.toFixed(2),
        (log?.undertimeHours || 0).toString(),
        details.undertimeDeduction.toFixed(2),
        details.holidayBonus.toFixed(2),
        details.totalDailyEarned.toFixed(2),
        `"${(log?.notes || '').replace(/"/g, '""')}"`
      ]);
    });

    rows.push(['']);
    rows.push(['SUMMARY BREAKDOWN']);
    rows.push(['Gross Pay', summary.grossPay.toFixed(2)]);
    rows.push(['Total Deductions', summary.totalDeductions.toFixed(2)]);
    summary.itemizedDeductions.forEach(d => {
      rows.push([`  - ${d.name}`, d.amount.toFixed(2)]);
    });
    rows.push(['Net Take-Home Pay', summary.netPay.toFixed(2)]);
    rows.push(['Total Days Rendered', summary.daysRendered.toString()]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MyPay_${profile.title.replace(/\s+/g, '_')}_${format(currentDate, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Backup (includes logs for ALL profiles)
  const handleExportJSON = () => {
    // Gather logs for every profile from localStorage
    const allProfileLogs: Record<string, Record<string, DailyLog>> = {};
    profiles.forEach(p => {
      const profileLogs = p.id === profile.id ? logs : getStoredLogs(p.id);
      if (Object.keys(profileLogs).length > 0) {
        allProfileLogs[p.id] = profileLogs;
      }
    });

    const exportData = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      activeProfileId: profile.id,
      profiles,
      allProfileLogs,
      // Keep legacy "logs" field for backward compatibility
      logs
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MyPay_Backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profiles && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
          // Support both v1.1 (allProfileLogs) and v1.0 (flat logs) formats
          let allProfileLogs: Record<string, Record<string, DailyLog>> = {};
          if (parsed.allProfileLogs && typeof parsed.allProfileLogs === 'object') {
            allProfileLogs = parsed.allProfileLogs;
          } else if (parsed.logs && typeof parsed.logs === 'object') {
            // Legacy format: assign flat logs to the active profile
            const targetId = parsed.activeProfileId || parsed.profiles[0].id;
            allProfileLogs[targetId] = parsed.logs;
          }

          onImportData({ profiles: parsed.profiles, allProfileLogs });
          alert('Data imported successfully!');
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container export-modal-card">
        <div className="modal-header flex justify-between items-center pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Download size={20} className="icon-primary" />
            <h3 className="text-lg font-bold">Export & Backup Data</h3>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4 py-4">
          <p className="text-xs text-muted">
            Export your payroll data to spreadsheet CSV or create/restore a JSON backup file.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* CSV Export Option */}
            <div className="export-option-card p-4 border rounded-xl bg-surface-dark hover:border-primary transition-all cursor-pointer" onClick={handleExportCSV}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10 text-success">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Export to CSV</h4>
                  <p className="text-xs text-muted">Excel / Google Sheets breakdown for {monthLabel}</p>
                </div>
              </div>
            </div>

            {/* JSON Backup Option */}
            <div className="export-option-card p-4 border rounded-xl bg-surface-dark hover:border-primary transition-all cursor-pointer" onClick={handleExportJSON}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <FileJson size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">JSON Full Backup</h4>
                  <p className="text-xs text-muted">Download complete backup of profiles & logs</p>
                </div>
              </div>
            </div>

            {/* JSON Restore Option */}
            <div className="export-option-card p-4 border rounded-xl bg-surface-dark hover:border-primary transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-warning/10 text-warning">
                  <Upload size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Import JSON Backup</h4>
                  <p className="text-xs text-muted">Restore data from a previously saved JSON file</p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer flex justify-between items-center pt-3 border-t border-border">
          {onResetAllData ? (
            <button 
              className="btn btn-ghost btn-sm text-danger flex items-center gap-1"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data and reset to a clean state?')) {
                  onResetAllData();
                }
              }}
            >
              <Trash2 size={14} /> Clear All Saved Data
            </button>
          ) : <div />}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import type { AppSettings, DailyLog } from '../../types';
import { calculatePeriodSummary } from '../../utils/calculatePay';
import { getMonthCalendarDays, formatDateKey } from '../../utils/dateUtils';
import { getMonth, getYear, format } from 'date-fns';
import { Download, FileSpreadsheet, FileJson, Upload, X, Trash2 } from 'lucide-react';

interface Props {
  currentDate: Date;
  settings: AppSettings;
  logs: Record<string, DailyLog>;
  onImportData: (data: { settings?: AppSettings; logs: Record<string, DailyLog> }) => void;
  onResetAllData?: () => void;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({
  currentDate,
  settings,
  logs,
  onImportData,
  onResetAllData,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const year = getYear(currentDate);
  const month = getMonth(currentDate);
  const monthLabel = format(currentDate, 'MMMM yyyy');
  const monthDays = getMonthCalendarDays(year, month).filter(d => getMonth(d) === month);
  const sym = settings.currencySymbol || '₱';

  const summary = calculatePeriodSummary(
    monthDays,
    logs,
    `Full Month - ${monthLabel}`
  );

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['MYPAY DAILY EARNINGS LOG'],
      [`Period: ${monthLabel}`],
      [`Currency: ${sym}`],
      [''],
      ['Date', 'Day', 'Amount Earned', 'Notes'],
    ];

    monthDays.forEach(date => {
      const dateStr = formatDateKey(date);
      const log = logs[dateStr];

      rows.push([
        dateStr,
        format(date, 'EEEE'),
        (log?.amount || 0).toFixed(2),
        `"${(log?.notes || '').replace(/"/g, '""')}"`
      ]);
    });

    rows.push(['']);
    rows.push(['SUMMARY']);
    rows.push(['Total Earned', summary.totalEarned.toFixed(2)]);
    rows.push(['Days Logged', summary.daysLogged.toString()]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MyPay_${format(currentDate, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Backup
  const handleExportJSON = () => {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
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
        if (parsed.logs && typeof parsed.logs === 'object') {
          onImportData({ settings: parsed.settings, logs: parsed.logs });
          alert('Data imported successfully!');
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
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
            Export your daily earnings to spreadsheet CSV or create/restore a JSON backup file.
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
                  <p className="text-xs text-muted">Download complete backup of settings & daily logs</p>
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

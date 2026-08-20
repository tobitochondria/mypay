import React, { useRef, useState } from 'react';
import type { AppSettings, DailyLog } from '../../types';
import { Download, Upload, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  onOpenExport: () => void;
  onImportData: (data: {
    settings?: AppSettings;
    logs: Record<string, DailyLog>;
  }) => void;
  onResetAllData: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenExport,
  onImportData,
  onResetAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleConfirmReset = () => {
    if (window.confirm('Are you sure you want to reset and delete all saved settings and daily earnings logs? This cannot be undone.')) {
      onResetAllData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate structure: must have a logs object
        if (!parsed.logs || typeof parsed.logs !== 'object') {
          setImportStatus('error');
          setImportMessage('Invalid file: no daily logs found. Please select a valid MyPay JSON backup file.');
          setTimeout(() => setImportStatus('idle'), 4000);
          return;
        }

        const logCount = Object.keys(parsed.logs).length;

        // Confirm with user before replacing data
        const confirmed = window.confirm(
          `Import ${logCount} day log(s)?\n\nThis will replace all your current settings and daily earnings logs.`
        );

        if (!confirmed) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        onImportData({
          settings: parsed.settings,
          logs: parsed.logs
        });

        setImportStatus('success');
        setImportMessage(`Successfully imported ${logCount} day log(s)!`);
        setTimeout(() => setImportStatus('idle'), 3500);
      } catch {
        setImportStatus('error');
        setImportMessage('Failed to parse file. Ensure it is a valid MyPay JSON backup file.');
        setTimeout(() => setImportStatus('idle'), 4000);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="app-header">
        {/* Hidden File Input for Data Import */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileChange}
        />

        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="brand-logo">
            <img src="/MyPay.svg" alt="MyPay Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              MyPay Calculator
            </h1>
            <p className="text-xs text-slate-500 font-normal leading-tight">
              Daily Earnings Tracker
            </p>
          </div>
        </div>

        {/* Right: Desktop Actions Container (hidden lg:flex) */}
        <div id="tour-import-export-actions" className="hidden lg:flex items-center gap-3">
          {/* Reset Data */}
          <button
            className="btn btn-ghost touch-target"
            onClick={handleConfirmReset}
            title="Delete all stored settings and logs"
            style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset All Data</span>
          </button>

          {/* Import Data */}
          <button
            className="btn btn-secondary btn-sm touch-target"
            onClick={() => fileInputRef.current?.click()}
            title="Import data from a MyPay JSON backup file"
          >
            <Upload size={14} />
            <span>Import Data</span>
          </button>

          {/* Export Data */}
          <button
            className="btn btn-primary btn-sm touch-target"
            onClick={onOpenExport}
          >
            <Download size={14} />
            <span>Export Data</span>
          </button>
        </div>

        {/* Right: Mobile & Tablet Actions Container (flex lg:hidden) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Standalone Action Icon Buttons */}
          <button
            className="btn btn-ghost touch-target p-2"
            onClick={handleConfirmReset}
            title="Reset All Data"
            style={{ color: 'var(--danger)', minWidth: '44px', minHeight: '44px' }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="btn btn-secondary btn-sm touch-target p-2"
            onClick={() => fileInputRef.current?.click()}
            title="Import Data"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Upload size={16} />
          </button>

          <button
            className="btn btn-primary btn-sm touch-target p-2"
            onClick={onOpenExport}
            title="Export Data"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* Import Status Toast */}
      {importStatus !== 'idle' && (
        <div
          style={{
            position: 'fixed',
            top: '4.5rem',
            right: '1.5rem',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
            animation: 'modalIn 0.2s ease',
            background: importStatus === 'success' ? 'var(--success)' : 'var(--danger)',
            color: '#ffffff',
          }}
        >
          {importStatus === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {importMessage}
        </div>
      )}
    </>
  );
};

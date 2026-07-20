import React, { useRef, useState } from 'react';
import type { JobProfile } from '../../types';
import { Download, Upload, Briefcase, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  activeProfile: JobProfile;
  onOpenExport: () => void;
  onImportData: (data: { 
    profiles: JobProfile[]; 
    logs?: Record<string, any>;
    allProfileLogs?: Record<string, Record<string, any>>;
  }) => void;
  onResetAllData: () => void;
}

export const Header: React.FC<Props> = ({
  activeProfile,
  onOpenExport,
  onImportData,
  onResetAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleConfirmReset = () => {
    if (window.confirm('Are you sure you want to reset and delete all saved profiles, earnings, and work logs? This cannot be undone.')) {
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

        // Validate structure: must have profiles array
        if (!parsed.profiles || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
          setImportStatus('error');
          setImportMessage('Invalid file: no profiles found. Please select a valid MyPay JSON backup file.');
          setTimeout(() => setImportStatus('idle'), 4000);
          return;
        }

        // Validate each profile has basic required fields
        const validProfiles = parsed.profiles.every((p: any) =>
          p.id && typeof p.id === 'string' &&
          p.title && typeof p.title === 'string'
        );

        if (!validProfiles) {
          setImportStatus('error');
          setImportMessage('Invalid file: profile data is malformed or incompatible.');
          setTimeout(() => setImportStatus('idle'), 4000);
          return;
        }

        let allProfileLogs = parsed.allProfileLogs;
        let logs = parsed.logs;

        // Count logs across profiles
        let totalLogs = 0;
        if (allProfileLogs && typeof allProfileLogs === 'object') {
          Object.values(allProfileLogs).forEach((pLogs: any) => {
            if (pLogs && typeof pLogs === 'object') {
              totalLogs += Object.keys(pLogs).length;
            }
          });
        } else if (logs && typeof logs === 'object') {
          totalLogs = Object.keys(logs).length;
        }

        // Confirm with user before replacing data
        const profileCount = parsed.profiles.length;
        const confirmed = window.confirm(
          `Import ${profileCount} profile(s) and ${totalLogs} total day log(s)?\n\nThis will replace all your current profiles and work logs.`
        );

        if (!confirmed) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        onImportData({ 
          profiles: parsed.profiles, 
          logs, 
          allProfileLogs 
        });

        setImportStatus('success');
        setImportMessage(`Successfully imported ${profileCount} profile(s) and ${totalLogs} day log(s)!`);
        setTimeout(() => setImportStatus('idle'), 3500);
      } catch (err) {
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
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="brand-logo">
            <img src="/MyPay.svg" alt="MyPay Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              MyPay Calculator
            </h1>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>
              Personal Salary, Wage & Payday Tracker
            </p>
          </div>
        </div>

        {/* Right: Profile Pill + Actions */}
        <div id="tour-import-export-actions" className="flex items-center gap-3">
          {/* Active Profile Pill */}
          <div className="active-profile-pill hidden sm:flex">
            <Briefcase size={14} style={{ color: 'var(--primary)' }} />
            <span>{activeProfile.title}</span>
            {activeProfile.company && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({activeProfile.company})</span>
            )}
          </div>

          {/* Reset Data */}
          <button
            className="btn btn-ghost"
            onClick={handleConfirmReset}
            title="Delete all stored profiles and logs"
            style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset All Data</span>
          </button>

          {/* Import Data */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Import data from a MyPay JSON backup file"
          >
            <Upload size={14} />
            <span>Import Data</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />

          {/* Export Data */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenExport}
          >
            <Download size={14} />
            <span>Export Data</span>
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

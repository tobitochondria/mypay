import { useState, useEffect } from 'react';
import type { AppSettings, DailyLog } from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredLogs,
  saveStoredLogs,
  clearAllStoredData,
  DEFAULT_SETTINGS
} from './utils/storage';
import { Header } from './components/UI/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import type { PayPeriodFilter } from './components/Calendar/CalendarHeader';
import { StatsSummary } from './components/Stats/StatsSummary';
import { ExportModal } from './components/Export/ExportModal';
import { SlidersHorizontal } from 'lucide-react';
import './App.css';

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => getStoredLogs());

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [periodFilter, setPeriodFilter] = useState<PayPeriodFilter>('all');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Sync settings to LocalStorage
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Sync logs to LocalStorage
  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  // Log update handler
  const handleSaveLog = (updatedLog: DailyLog) => {
    setLogs(prev => ({
      ...prev,
      [updatedLog.date]: updatedLog
    }));
  };

  // Log delete / undo handler
  const handleDeleteLog = (dateStr: string) => {
    setLogs(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  // Backup restore handler
  const handleImportData = (data: {
    settings?: AppSettings;
    logs: Record<string, DailyLog>;
  }) => {
    clearAllStoredData();

    const newSettings = data.settings || DEFAULT_SETTINGS;
    saveStoredSettings(newSettings);
    saveStoredLogs(data.logs);

    setSettings(newSettings);
    setLogs(data.logs);
  };

  const handleResetAllData = () => {
    clearAllStoredData();
    setSettings(DEFAULT_SETTINGS);
    setLogs({});
    setShowExportModal(false);
  };

  return (
    <div className="app-container w-full max-w-full overflow-x-hidden">
      <Header
        onOpenExport={() => setShowExportModal(true)}
        onImportData={handleImportData}
        onResetAllData={handleResetAllData}
      />

      <main className="main-layout-grid w-full max-w-full">
        {/* Left Side Settings Panel (Desktop >1024px) */}
        <div className="hidden lg:block sidebar-wrapper">
          <Sidebar
            settings={settings}
            onUpdateSettings={setSettings}
            onResetAllData={handleResetAllData}
          />
        </div>

        {/* Right Side Interactive Calendar & Bottom Statistics */}
        <div className="right-column-wrapper w-full max-w-full px-4 sm:px-6 py-4 space-y-4 box-border">
          <CalendarGrid
            currentDate={currentDate}
            onCurrentDateChange={setCurrentDate}
            logs={logs}
            settings={settings}
            onSaveLog={handleSaveLog}
            onDeleteLog={handleDeleteLog}
            periodFilter={periodFilter}
            onFilterChange={setPeriodFilter}
          />

          <StatsSummary
            currentDate={currentDate}
            logs={logs}
            settings={settings}
            onUpdateSettings={setSettings}
            periodFilter={periodFilter}
          />
        </div>
      </main>

      {/* Floating Action Button for Mobile/Tablet Settings */}
      <button
        className="mobile-fab-btn tablet-only mobile-only"
        onClick={() => setIsDrawerOpen(true)}
        title="Open Settings"
      >
        <SlidersHorizontal size={18} />
        <span>Settings</span>
      </button>

      {/* Slide-out Drawer for Mobile/Tablet (<1024px) */}
      {isDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />
          <div className="drawer-content">
            <Sidebar
              settings={settings}
              onUpdateSettings={setSettings}
              onResetAllData={handleResetAllData}
              onCloseDrawer={() => setIsDrawerOpen(false)}
            />
          </div>
        </>
      )}

      {/* Export / Import & Print PDF Modal */}
      {showExportModal && (
        <ExportModal
          currentDate={currentDate}
          settings={settings}
          logs={logs}
          onImportData={handleImportData}
          onResetAllData={handleResetAllData}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;

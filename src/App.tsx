import { useState, useEffect } from 'react';
import type { JobProfile, DailyLog, Holiday } from './types';
import { 
  getStoredProfiles, 
  saveStoredProfiles, 
  getActiveProfileId, 
  saveActiveProfileId, 
  getStoredLogs, 
  saveStoredLogs,
  clearAllStoredData,
  DEFAULT_PROFILES
} from './utils/storage';
import { fetchCountryHolidays } from './utils/dateUtils';
import { Header } from './components/UI/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import type { PayPeriodFilter } from './components/Calendar/CalendarHeader';
import { StatsSummary } from './components/Stats/StatsSummary';
import { ExportModal } from './components/Export/ExportModal';
import { getYear } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';
import './App.css';

export function App() {
  const [profiles, setProfiles] = useState<JobProfile[]>(() => getStoredProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => getActiveProfileId());
  
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [periodFilter, setPeriodFilter] = useState<PayPeriodFilter>('all');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Daily logs for active profile
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => getStoredLogs(activeProfile.id));

  // Auto-loaded holidays for country
  const [autoHolidays, setAutoHolidays] = useState<Holiday[]>([]);

  // Sync profiles to LocalStorage
  useEffect(() => {
    saveStoredProfiles(profiles);
  }, [profiles]);

  // Sync active profile ID
  useEffect(() => {
    saveActiveProfileId(activeProfile.id);
    setLogs(getStoredLogs(activeProfile.id));
  }, [activeProfile.id]);

  // Sync logs to LocalStorage
  useEffect(() => {
    saveStoredLogs(activeProfile.id, logs);
  }, [logs, activeProfile.id]);

  // Fetch country holidays when profile country or date changes
  useEffect(() => {
    const country = activeProfile.countryCode || 'PH';
    const year = getYear(currentDate);
    const hols = fetchCountryHolidays(country, year);
    setAutoHolidays(hols);
  }, [activeProfile.countryCode, currentDate]);

  // Profile Management Handlers
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const handleAddProfile = (newProfilePartial: Partial<JobProfile>) => {
    const newId = `profile-${Date.now()}`;
    const newProf: JobProfile = {
      ...activeProfile, // Copy base configuration defaults
      id: newId,
      title: newProfilePartial.title || 'New Job',
      company: newProfilePartial.company || 'New Company',
      startDate: newProfilePartial.startDate,
      endDate: newProfilePartial.endDate,
      dailyRate: activeProfile.dailyRate || 0,
      customHolidays: []
    };

    setProfiles(prev => [...prev, newProf]);
    setActiveProfileId(newId);
  };

  const handleUpdateProfile = (updated: JobProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter(p => p.id !== id);
    setProfiles(remaining);
    setActiveProfileId(remaining[0].id);
  };

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

  // Backup restore handler (supports both single-profile and multi-profile logs)
  const handleImportData = (data: { 
    profiles: JobProfile[]; 
    logs?: Record<string, DailyLog>;
    allProfileLogs?: Record<string, Record<string, DailyLog>>;
  }) => {
    if (data.profiles && data.profiles.length > 0) {
      clearAllStoredData();
      
      const newActiveId = data.profiles[0].id;
      saveStoredProfiles(data.profiles);
      saveActiveProfileId(newActiveId);

      // Save multi-profile logs to localStorage
      if (data.allProfileLogs && typeof data.allProfileLogs === 'object') {
        Object.entries(data.allProfileLogs).forEach(([pId, pLogs]) => {
          saveStoredLogs(pId, pLogs);
        });
        setLogs(data.allProfileLogs[newActiveId] || {});
      } else if (data.logs) {
        saveStoredLogs(newActiveId, data.logs);
        setLogs(data.logs);
      } else {
        setLogs({});
      }

      setProfiles(data.profiles);
      setActiveProfileId(newActiveId);
    }
  };

  const handleResetAllData = () => {
    clearAllStoredData();
    setProfiles(DEFAULT_PROFILES);
    setActiveProfileId(DEFAULT_PROFILES[0].id);
    setLogs({});
    setShowExportModal(false);
  };

  return (
    <div className="app-container w-full max-w-full overflow-x-hidden">
      <Header
        activeProfile={activeProfile}
        onOpenExport={() => setShowExportModal(true)}
        onImportData={handleImportData}
        onResetAllData={handleResetAllData}
      />

      <main className="main-layout-grid w-full max-w-full">
        {/* Left Side Configurable Settings Panel (Desktop >1024px) */}
        <div className="hidden lg:block sidebar-wrapper">
          <Sidebar
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
            onUpdateProfile={handleUpdateProfile}
            onDeleteProfile={handleDeleteProfile}
            autoHolidays={autoHolidays}
            onResetAllData={handleResetAllData}
          />
        </div>

        {/* Right Side Interactive Calendar & Bottom Statistics */}
        <div className="right-column-wrapper w-full max-w-full px-4 sm:px-6 py-4 space-y-4 box-border">
          <CalendarGrid
            currentDate={currentDate}
            onCurrentDateChange={setCurrentDate}
            profile={activeProfile}
            logs={logs}
            onSaveLog={handleSaveLog}
            onDeleteLog={handleDeleteLog}
            autoHolidays={autoHolidays}
            periodFilter={periodFilter}
            onFilterChange={setPeriodFilter}
          />

          <StatsSummary
            currentDate={currentDate}
            profile={activeProfile}
            logs={logs}
            autoHolidays={autoHolidays}
            periodFilter={periodFilter}
          />
        </div>
      </main>

      {/* Floating Action Button for Mobile/Tablet Pay Configuration */}
      <button
        className="mobile-fab-btn tablet-only mobile-only"
        onClick={() => setIsDrawerOpen(true)}
        title="Open Pay Configuration"
      >
        <SlidersHorizontal size={18} />
        <span>Configure Pay</span>
      </button>

      {/* Slide-out Drawer for Mobile/Tablet (<1024px) */}
      {isDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />
          <div className="drawer-content">
            <Sidebar
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={handleSelectProfile}
              onAddProfile={handleAddProfile}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
              autoHolidays={autoHolidays}
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
          profile={activeProfile}
          profiles={profiles}
          logs={logs}
          autoHolidays={autoHolidays}
          onImportData={handleImportData}
          onResetAllData={handleResetAllData}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;


import React from 'react';
import type { JobProfile, Holiday } from '../../types';
import { ProfileSelector } from './ProfileSelector';
import { WageSettings } from './WageSettings';
import { SchedulePicker } from './SchedulePicker';
import { DeductionsForm } from './DeductionsForm';
import { HolidaySettings } from './HolidaySettings';
import { Settings, HelpCircle, Trash2 } from 'lucide-react';
import { startAppTour } from '../../utils/tour';

interface Props {
  profiles: JobProfile[];
  activeProfile: JobProfile;
  onSelectProfile: (id: string) => void;
  onAddProfile: (newProfile: Partial<JobProfile>) => void;
  onUpdateProfile: (updated: JobProfile) => void;
  onDeleteProfile: (id: string) => void;
  autoHolidays: Holiday[];
  onResetAllData?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  autoHolidays,
  onResetAllData
}) => {
  return (
    <aside className="sidebar-container space-y-4">
      <div className="sidebar-header flex items-center justify-between gap-2">
        <h2 className="sidebar-title" style={{ whiteSpace: 'nowrap' }}>
          <Settings size={18} className="icon-primary" />
          <span>Pay Configuration</span>
        </h2>
        <button
          id="btn-take-tour"
          className="btn btn-xs btn-primary flex items-center gap-1.5 font-semibold"
          onClick={startAppTour}
          title="Start interactive app walkthrough tour"
          style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.625rem' }}
        >
          <HelpCircle size={13} />
          <span>Take a Tour</span>
        </button>
      </div>

      <div id="tour-profile-selector">
        <ProfileSelector
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={onSelectProfile}
          onAddProfile={onAddProfile}
          onUpdateProfile={onUpdateProfile}
          onDeleteProfile={onDeleteProfile}
        />
      </div>

      <div id="tour-wage-settings">
        <WageSettings
          profile={activeProfile}
          onChange={onUpdateProfile}
        />
      </div>

      <div id="tour-work-schedule">
        <SchedulePicker
          schedule={activeProfile.workSchedule}
          onChange={(sch) => onUpdateProfile({ ...activeProfile, workSchedule: sch })}
        />
      </div>

      <div id="tour-deductions">
        <DeductionsForm
          profile={activeProfile}
          onChange={onUpdateProfile}
        />
      </div>

      <div id="tour-holidays">
        <HolidaySettings
          profile={activeProfile}
          onChange={onUpdateProfile}
          autoHolidays={autoHolidays}
        />
      </div>

      {onResetAllData && (
        <button
          className="sidebar-reset-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete all saved profiles and work logs? This action cannot be undone.')) {
              onResetAllData();
            }
          }}
        >
          <Trash2 size={16} />
          Reset & Clear All Data
        </button>
      )}
    </aside>
  );
};

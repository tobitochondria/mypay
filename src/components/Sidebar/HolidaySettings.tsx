import React, { useState } from 'react';
import type { JobProfile, Holiday, HolidayType } from '../../types';
import { Flag, Plus, Trash2, CalendarCheck } from 'lucide-react';

interface Props {
  profile: JobProfile;
  onChange: (updated: JobProfile) => void;
  autoHolidays: Holiday[];
}

const COUNTRIES = [
  { code: 'PH', name: 'Philippines (PH)' },
  { code: 'US', name: 'United States (US)' },
  { code: 'GB', name: 'United Kingdom (UK)' },
  { code: 'CA', name: 'Canada (CA)' },
  { code: 'AU', name: 'Australia (AU)' },
  { code: 'JP', name: 'Japan (JP)' },
  { code: 'SG', name: 'Singapore (SG)' },
];

export const HolidaySettings: React.FC<Props> = ({ profile, onChange, autoHolidays }) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [custName, setCustName] = useState('');
  const [custDate, setCustDate] = useState('');
  const [custType, setCustType] = useState<HolidayType>('regular');
  const [custMult, setCustMult] = useState('2.0');

  const handleCountryChange = (code: string) => {
    onChange({ ...profile, countryCode: code });
  };

  const handleAddCustom = () => {
    if (!custName.trim() || !custDate) return;
    const mult = parseFloat(custMult) || 1.5;
    const newHol: Holiday = {
      id: `custom-hol-${Date.now()}`,
      name: custName.trim(),
      date: custDate,
      type: custType,
      multiplier: mult,
      isCustom: true
    };

    onChange({
      ...profile,
      customHolidays: [...(profile.customHolidays || []), newHol]
    });

    setCustName('');
    setCustDate('');
    setShowAddCustom(false);
  };

  const handleDeleteCustom = (id: string) => {
    onChange({
      ...profile,
      customHolidays: (profile.customHolidays || []).filter(h => h.id !== id)
    });
  };

  return (
    <div className="sidebar-card">
      <div className="card-header">
        <div className="card-header-title">
          <Flag className="icon icon-purple" size={18} />
          <span>Holidays & Regional Settings</span>
        </div>
        <button 
          className="btn-icon btn-ghost" 
          title="Add Custom Company Holiday"
          onClick={() => setShowAddCustom(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 mt-2">
        <div>
          <label className="form-label">Holiday Country Preset</label>
          <select
            className="form-control"
            value={profile.countryCode || 'PH'}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="stat-hint-box">
          <span>Auto-detected:</span>
          <strong style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{autoHolidays.length} active</strong>
        </div>

        {(profile.customHolidays || []).length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">
              Custom Holidays ({profile.customHolidays.length})
            </div>
            {profile.customHolidays.map(h => (
              <div key={h.id} className="custom-holiday-item flex items-center justify-between text-xs py-1 px-2 border rounded">
                <div>
                  <span className="font-semibold">{h.name}</span>
                  <span className="text-muted ml-2">({h.date})</span>
                  <span className="badge badge-neutral ml-1">{h.multiplier}x</span>
                </div>
                <button
                  className="btn-icon btn-ghost btn-xs text-danger"
                  onClick={() => handleDeleteCustom(h.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddCustom && (
          <div className="inline-modal-card mt-2">
            <h5 className="font-semibold text-xs mb-2 flex items-center gap-1">
              <CalendarCheck size={14} /> Add Custom Holiday
            </h5>
            <div className="space-y-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Holiday Name (e.g. Company Founding Day)"
              />
              <input
                type="date"
                className="form-control form-control-sm"
                value={custDate}
                onChange={(e) => setCustDate(e.target.value)}
              />
              <div className="flex gap-2">
                <select
                  className="form-control form-control-sm w-1/2"
                  value={custType}
                  onChange={(e) => setCustType(e.target.value as HolidayType)}
                >
                  <option value="regular">Regular Holiday</option>
                  <option value="special">Special Non-Working</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  className="form-control form-control-sm w-1/2"
                  value={custMult}
                  onChange={(e) => setCustMult(e.target.value)}
                  placeholder="Multiplier (2.0)"
                />
              </div>
              <div className="btn-group mt-2">
                <button className="btn btn-primary btn-xs" onClick={handleAddCustom}>
                  Save Holiday
                </button>
                <button className="btn btn-secondary btn-xs" onClick={() => setShowAddCustom(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

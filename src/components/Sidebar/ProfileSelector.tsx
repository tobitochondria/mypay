import React, { useState } from 'react';
import type { JobProfile } from '../../types';
import { Briefcase, Plus, Trash2, Edit2, Check, X, Calendar, UserCheck } from 'lucide-react';

interface Props {
  profiles: JobProfile[];
  activeProfile: JobProfile;
  onSelectProfile: (id: string) => void;
  onAddProfile: (newProfile: Partial<JobProfile>) => void;
  onUpdateProfile: (updated: JobProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileSelector: React.FC<Props> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [editTitle, setEditTitle] = useState(activeProfile.title);
  const [editCompany, setEditCompany] = useState(activeProfile.company);
  const [editStartDate, setEditStartDate] = useState(activeProfile.startDate || '');
  const [editEndDate, setEditEndDate] = useState(activeProfile.endDate || '');
  const [editEmploymentType, setEditEmploymentType] = useState<'regular' | 'contractual'>(
    activeProfile.employmentType || 'regular'
  );

  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newEmploymentType, setNewEmploymentType] = useState<'regular' | 'contractual'>('regular');

  const handleStartEdit = () => {
    setEditTitle(activeProfile.title);
    setEditCompany(activeProfile.company);
    setEditStartDate(activeProfile.startDate || '');
    setEditEndDate(activeProfile.endDate || '');
    setEditEmploymentType(activeProfile.employmentType || 'regular');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdateProfile({
      ...activeProfile,
      title: editTitle.trim(),
      company: editCompany.trim(),
      startDate: editStartDate || undefined,
      endDate: editEndDate || undefined,
      employmentType: editEmploymentType
    });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    if (!newTitle.trim()) return;
    onAddProfile({
      title: newTitle.trim(),
      company: newCompany.trim() || 'My Company',
      startDate: newStartDate || undefined,
      endDate: newEndDate || undefined,
      employmentType: newEmploymentType
    });
    setNewTitle('');
    setNewCompany('');
    setNewStartDate('');
    setNewEndDate('');
    setNewEmploymentType('regular');
    setIsAdding(false);
  };

  return (
    <div className="sidebar-card">
      <div className="card-header">
        <div className="card-header-title">
          <Briefcase className="icon icon-primary" size={18} />
          <span>Source of Income</span>
        </div>
        <button 
          className="btn-icon btn-ghost" 
          title="Add New Income Profile"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      {!isEditing ? (
        <div className="profile-selector-body">
          <div className="select-wrapper">
            <select
              className="form-control profile-select"
              value={activeProfile.id}
              onChange={(e) => onSelectProfile(e.target.value)}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.company ? `(${p.company})` : ''} — {p.employmentType === 'contractual' ? 'Contractual' : 'Regular'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1 text-muted">
              <UserCheck size={13} className="text-primary" />
              <span>Type: </span>
              <strong className="text-foreground capitalize">{activeProfile.employmentType || 'regular'}</strong>
              {activeProfile.employmentType === 'contractual' ? (
                <span className="text-muted italic">(Holidays Off • No Multipliers)</span>
              ) : (
                <span className="text-success italic">(Holiday Multipliers Active)</span>
              )}
            </div>
          </div>

          {(activeProfile.startDate || activeProfile.endDate) && (
            <div className="text-xs text-muted flex items-center gap-1 mt-1">
              <Calendar size={12} />
              <span>
                {activeProfile.startDate ? `From ${activeProfile.startDate}` : 'Start'} 
                {activeProfile.endDate ? ` to ${activeProfile.endDate}` : ' (Ongoing)'}
              </span>
            </div>
          )}

          <div className="profile-actions-bar mt-2 flex justify-between">
            <button className="btn-text btn-sm" onClick={handleStartEdit}>
              <Edit2 size={13} /> Edit Profile & Dates
            </button>
            {profiles.length > 1 && (
              <button 
                className="btn-text btn-sm text-danger" 
                onClick={() => onDeleteProfile(activeProfile.id)}
                title="Delete active profile"
              >
                <Trash2 size={13} /> Delete Profile
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="edit-profile-form space-y-2">
          <div>
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              className="form-control"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div>
            <label className="form-label">Company / Client</label>
            <input
              type="text"
              className="form-control"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="form-label">Employment Type</label>
            <div className="radio-button-group">
              <button
                type="button"
                className={`radio-btn ${editEmploymentType === 'regular' ? 'active' : ''}`}
                onClick={() => setEditEmploymentType('regular')}
              >
                Regular (Holiday Multipliers)
              </button>
              <button
                type="button"
                className={`radio-btn ${editEmploymentType === 'contractual' ? 'active' : ''}`}
                onClick={() => setEditEmploymentType('contractual')}
              >
                Contractual (No Multipliers)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="form-label truncate">Start Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label truncate" title="End Date (Optional)">End Date (Opt)</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="btn-group mt-3 flex gap-2">
            <button className="btn btn-primary btn-sm flex-1" onClick={handleSaveEdit}>
              <Check size={14} /> Save
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="modal-backdrop-inline mt-3">
          <div className="inline-modal-card">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1">
              <Plus size={16} /> New Income Profile
            </h4>
            <div className="space-y-2">
              <div>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Graphic Designer"
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Company / Client</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Tech Studio"
                />
              </div>

              <div>
                <label className="form-label">Employment Type</label>
                <div className="radio-button-group">
                  <button
                    type="button"
                    className={`radio-btn ${newEmploymentType === 'regular' ? 'active' : ''}`}
                    onClick={() => setNewEmploymentType('regular')}
                  >
                    Regular
                  </button>
                  <button
                    type="button"
                    className={`radio-btn ${newEmploymentType === 'contractual' ? 'active' : ''}`}
                    onClick={() => setNewEmploymentType('contractual')}
                  >
                    Contractual
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="form-label truncate">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label truncate" title="End Date (Optional)">End Date (Opt)</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="btn-group mt-3 flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleCreateNew}>
                  Create Profile
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

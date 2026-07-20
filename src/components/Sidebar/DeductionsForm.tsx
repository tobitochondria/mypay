import React, { useState } from 'react';
import type { JobProfile, Deduction, DeductionType } from '../../types';
import { Receipt, Plus, Trash2 } from 'lucide-react';

interface Props {
  profile: JobProfile;
  onChange: (updated: JobProfile) => void;
}

export const DeductionsForm: React.FC<Props> = ({ profile, onChange }) => {
  const [newDedName, setNewDedName] = useState('');
  const [newDedType, setNewDedType] = useState<DeductionType>('fixed');
  const [newDedValue, setNewDedValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleTaxChange = (field: keyof Deduction, val: any) => {
    onChange({
      ...profile,
      taxDeduction: {
        ...profile.taxDeduction,
        [field]: val
      }
    });
  };

  const handleAddDeduction = () => {
    if (!newDedName.trim()) return;
    const val = parseFloat(newDedValue) || 0;
    const newDed: Deduction = {
      id: `ded-${Date.now()}`,
      name: newDedName.trim(),
      type: newDedType,
      value: val
    };

    onChange({
      ...profile,
      otherDeductions: [...(profile.otherDeductions || []), newDed]
    });

    setNewDedName('');
    setNewDedValue('');
    setShowAddForm(false);
  };

  const handleDeleteDeduction = (id: string) => {
    onChange({
      ...profile,
      otherDeductions: (profile.otherDeductions || []).filter(d => d.id !== id)
    });
  };

  const handleUpdateDeduction = (id: string, field: keyof Deduction, val: any) => {
    const updated = (profile.otherDeductions || []).map(d => {
      if (d.id === id) {
        return { ...d, [field]: val };
      }
      return d;
    });
    onChange({
      ...profile,
      otherDeductions: updated
    });
  };

  return (
    <div className="sidebar-card">
      <div className="card-header">
        <div className="card-header-title">
          <Receipt className="icon icon-danger" size={18} />
          <span>Taxes & Deductions</span>
        </div>
        <button 
          className="btn-icon btn-ghost" 
          title="Add Other Deduction"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 mt-2">
        {/* Tax Section */}
        <div className="deduction-box">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm">Tax Deduction</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3">
              <input
                type="text"
                className="form-control form-control-sm"
                value={profile.taxDeduction.name}
                onChange={(e) => handleTaxChange('name', e.target.value)}
                placeholder="Tax Name"
              />
            </div>
            <div className="col-span-2 flex gap-1">
              <select
                className="form-control form-control-sm compact-select"
                value={profile.taxDeduction.type}
                onChange={(e) => handleTaxChange('type', e.target.value as DeductionType)}
              >
                <option value="percentage">%</option>
                <option value="fixed">{profile.currencySymbol}</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control form-control-sm"
                value={profile.taxDeduction.value || ''}
                onChange={(e) => handleTaxChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Other Deductions List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Other Deductions ({profile.otherDeductions?.length || 0})
          </div>

          {(profile.otherDeductions || []).map((ded) => (
            <div key={ded.id} className="deduction-row-item">
              <div className="grid grid-cols-6 gap-2 items-center w-full">
                <div className="col-span-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={ded.name}
                    onChange={(e) => handleUpdateDeduction(ded.id, 'name', e.target.value)}
                    placeholder="Deduction Name"
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  <select
                    className="form-control form-control-sm compact-select"
                    value={ded.type}
                    onChange={(e) => handleUpdateDeduction(ded.id, 'type', e.target.value as DeductionType)}
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">{profile.currencySymbol}</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control form-control-sm"
                    value={ded.value || ''}
                    onChange={(e) => handleUpdateDeduction(ded.id, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    className="btn-icon btn-ghost btn-sm text-danger"
                    onClick={() => handleDeleteDeduction(ded.id)}
                    title="Remove deduction"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Deduction Form Modal/Inline */}
        {showAddForm && (
          <div className="inline-modal-card mt-2">
            <h5 className="font-semibold text-xs mb-2 flex items-center gap-1">
              <Plus size={14} /> Add New Deduction
            </h5>
            <div className="space-y-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={newDedName}
                onChange={(e) => setNewDedName(e.target.value)}
                placeholder="e.g. SSS, Health, 401k"
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  className="form-control form-control-sm w-1/3"
                  value={newDedType}
                  onChange={(e) => setNewDedType(e.target.value as DeductionType)}
                >
                  <option value="fixed">Fixed ({profile.currencySymbol})</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control form-control-sm w-2/3"
                  value={newDedValue}
                  onChange={(e) => setNewDedValue(e.target.value)}
                  placeholder="Amount / Rate"
                />
              </div>
              <div className="btn-group mt-2">
                <button className="btn btn-primary btn-xs" onClick={handleAddDeduction}>
                  Add Deduction
                </button>
                <button className="btn btn-secondary btn-xs" onClick={() => setShowAddForm(false)}>
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

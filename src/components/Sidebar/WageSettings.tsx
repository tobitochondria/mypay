import React from 'react';
import type { JobProfile, PaymentFrequency, PaydayRule } from '../../types';
import { DollarSign, Clock, Calendar, ShieldAlert } from 'lucide-react';

interface Props {
  profile: JobProfile;
  onChange: (updated: JobProfile) => void;
}

export const WageSettings: React.FC<Props> = ({ profile, onChange }) => {
  const handleRateChange = (val: string) => {
    const num = parseFloat(val) || 0;
    onChange({ ...profile, dailyRate: num });
  };

  const handleShiftChange = (val: string) => {
    const num = parseFloat(val) || 0;
    onChange({ ...profile, shiftLengthHours: num });
  };

  const handleCurrencyChange = (sym: string) => {
    onChange({ ...profile, currencySymbol: sym });
  };

  const handleFrequencyChange = (freq: PaymentFrequency) => {
    onChange({ ...profile, paymentFrequency: freq });
  };

  const handlePaydayRuleChange = (rule: PaydayRule) => {
    onChange({ ...profile, paydayRule: rule });
  };

  const hourlyRate = profile.shiftLengthHours > 0 ? (profile.dailyRate / profile.shiftLengthHours) : 0;

  return (
    <div className="sidebar-card">
      <div className="card-header">
        <div className="card-header-title">
          <DollarSign className="icon icon-success" size={18} />
          <span>Pay & Shift Configuration</span>
        </div>
      </div>

      <div className="space-y-3 mt-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="form-label">Currency</label>
            <input
              type="text"
              className="form-control text-center font-bold"
              value={profile.currencySymbol}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              placeholder="₱"
            />
          </div>
          <div className="col-span-2">
            <label className="form-label">Daily Wage Rate *</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">{profile.currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={profile.dailyRate || ''}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="2500.00"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="form-label flex items-center gap-1">
            <Clock size={13} /> Shift Length
          </label>
          <div className="input-suffix-wrapper">
            <input
              type="number"
              step="0.5"
              min="1"
              className="form-control"
              value={profile.shiftLengthHours || ''}
              onChange={(e) => handleShiftChange(e.target.value)}
              placeholder="10"
            />
            <span className="input-suffix">hrs</span>
          </div>
        </div>

        {profile.shiftLengthHours > 0 && (
          <div className="stat-hint-box">
            <span>Hourly Rate:</span>
            <strong>{profile.currencySymbol}{hourlyRate.toFixed(2)} / hr</strong>
          </div>
        )}

        <div className="divider" />

        <div>
          <label className="form-label flex items-center gap-1">
            <Calendar size={13} /> Payment Frequency
          </label>
          <div className="radio-button-group">
            <button
              type="button"
              className={`radio-btn ${profile.paymentFrequency === 'semi-monthly' ? 'active' : ''}`}
              onClick={() => handleFrequencyChange('semi-monthly')}
            >
              Semi-Monthly
            </button>
            <button
              type="button"
              className={`radio-btn ${profile.paymentFrequency === 'monthly' ? 'active' : ''}`}
              onClick={() => handleFrequencyChange('monthly')}
            >
              Monthly
            </button>
          </div>
          <p className="form-help-text mt-1">
            {profile.paymentFrequency === 'semi-monthly' 
              ? 'Paydays on 15th & end of month (28/29/30/31)' 
              : 'Payday on end of month'}
          </p>
        </div>

        <div>
          <label className="form-label flex items-center gap-1 truncate" style={{ whiteSpace: 'nowrap' }} title="Weekend / Holiday Payday Rule">
            <ShieldAlert size={13} /> Weekend / Holiday Payday Rule
          </label>
          <select
            className="form-control"
            value={profile.paydayRule || 'on-or-before'}
            onChange={(e) => handlePaydayRuleChange(e.target.value as PaydayRule)}
          >
            <option value="on-or-before">On or Before Payday (Previous Weekday)</option>
            <option value="after">After Weekend / Holiday (Next Weekday)</option>
            <option value="exact">Exact Calendar Date (No Shift)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

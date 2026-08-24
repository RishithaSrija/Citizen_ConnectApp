'use client';

import React, { useState } from 'react';
import { Save, CheckCircle, Database, Bell, Shield, Sliders } from 'lucide-react';

export default function AdminSettings() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [relayAlerts, setRelayAlerts] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const handleBackup = () => {
    alert('Mock backup archive successfully exported.');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div className="settings-intro">
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Portal Administration Settings</h1>
        <p style={{ marginTop: '4px' }}>Configure system configurations, notification relays, backup schedules, and authentication variables.</p>
      </div>

      {saved && (
        <div className="pref-saved-banner-stitch" style={{ backgroundColor: 'var(--priority-low-bg)', color: 'var(--priority-low)', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle size={16} />
          <span>System configuration saved successfully.</span>
        </div>
      )}

      <div className="settings-grid-stitch" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* General portal variables */}
          <div className="admin-panel-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              <Sliders size={16} style={{ color: 'var(--primary)' }} />
              <span>Portal Variables</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Routing Method</label>
                <select defaultValue="ai_heuristic" style={{ padding: '8px', fontSize: '13px' }}>
                  <option value="ai_heuristic">AI Classification Routing</option>
                  <option value="manual">Manual Administrative Review</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Auto-Closure Threshold</label>
                <select defaultValue="7" style={{ padding: '8px', fontSize: '13px' }}>
                  <option value="3">3 Days after Resolution</option>
                  <option value="7">7 Days after Resolution</option>
                  <option value="14">14 Days after Resolution</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security details */}
          <div className="admin-panel-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} />
              <span>Security Guardrails</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="mfa"
                  checked={mfaEnabled}
                  onChange={e => setMfaEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="mfa" style={{ margin: 0, fontSize: '13.5px', fontWeight: 700 }}>Require Admin Multi-Factor Authentication</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            <Save size={14} />
            <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
          </button>
        </form>

        {/* Right column: Database backups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-panel-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              <Database size={16} style={{ color: 'var(--primary)' }} />
              <span>Database Maintenance</span>
            </h3>
            
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.5' }}>
              Export snapshots of your active collections (Users, Complaints, Departments, and System Notifications) persistently.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Auto Backup Schedule</label>
                <select value={backupSchedule} onChange={e => setBackupSchedule(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily Backup</option>
                  <option value="weekly">Weekly Archive</option>
                </select>
              </div>
              
              <button type="button" className="btn btn-secondary" onClick={handleBackup} style={{ gap: '6px', justifyContent: 'center' }}>
                <Database size={14} />
                <span>Export database.json backup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

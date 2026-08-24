'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Award,
  Bell,
  Lock,
  LifeBuoy,
  LogOut,
  Save,
  CheckCircle
} from 'lucide-react';
import { Complaint } from '@/lib/db';

export default function CitizenProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile preferences states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const data = await res.json();
          setComplaints(data.complaints || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalReports = complaints.length;
  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  // Calculate dynamic impact score
  const impactScore = resolvedCount * 25 + (totalReports - resolvedCount) * 10;

  const handleSavePref = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Intro */}
      <div className="profile-header-card-stitch animate-fade-in">
        <div className="profile-top-row-stitch">
          <div className="profile-avatar-large-stitch">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Avatar" />
          </div>
          
          <div className="profile-titles-stitch">
            <div className="name-badge-row-stitch">
              <h2 className="profile-name-stitch-large">{user.name}</h2>
              <div className="verified-resident-badge-stitch">
                <ShieldCheck size={12} />
                <span>Verified Resident</span>
              </div>
            </div>
            <span className="profile-email-sub-stitch">{user.email}</span>
          </div>
        </div>

        {/* Stats Grid Dashboard widgets */}
        <div className="profile-stats-grid-stitch">
          <div className="p-stat-widget-stitch">
            <span className="p-stat-val-stitch">
              {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
            </span>
            <span className="p-stat-lbl-stitch">Member Since</span>
          </div>

          <div className="p-stat-widget-stitch">
            <span className="p-stat-val-stitch">{loading ? '...' : totalReports}</span>
            <span className="p-stat-lbl-stitch">Total Reports</span>
          </div>

          <div className="p-stat-widget-stitch">
            <span className="p-stat-val-stitch" style={{ color: 'var(--primary)' }}>
              {loading ? '...' : impactScore}
            </span>
            <span className="p-stat-lbl-stitch">Impact Score</span>
          </div>
        </div>
      </div>

      {/* Settings layout cards */}
      <div className="profile-settings-split-stitch">
        
        {/* Left Column: Sections list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Account Details card */}
          <div className="settings-card-stitch animate-fade-in">
            <h3 className="settings-card-title-stitch">
              <User size={16} />
              <span>Account Information</span>
            </h3>
            
            <div className="account-details-rows-stitch">
              <div className="acc-info-row-stitch">
                <span className="a-lbl">Phone Number</span>
                <span className="a-val">{user.phone}</span>
              </div>
              <div className="acc-info-row-stitch">
                <span className="a-lbl">System Permission</span>
                <span className="a-val" style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--primary)' }}>
                  Citizen access
                </span>
              </div>
            </div>
          </div>

          {/* Security & Support cards */}
          <div className="settings-card-stitch animate-fade-in">
            <h3 className="settings-card-title-stitch">
              <Lock size={16} />
              <span>Security</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.4' }}>
              Your account password has been verified. To change credentials or set up MFA, visit Security Settings.
            </p>
          </div>

          <div className="settings-card-stitch animate-fade-in">
            <h3 className="settings-card-title-stitch">
              <LifeBuoy size={16} />
              <span>Support & Help</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.4' }}>
              Facing issues submitting requests? Speak to our AI assistant or contact the municipal grievance desk at <strong>support@citizenconnect.gov</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Notifications Form */}
        <form onSubmit={handleSavePref} className="settings-card-stitch pref-panel animate-fade-in">
          <h3 className="settings-card-title-stitch">
            <Bell size={16} />
            <span>Notification Settings</span>
          </h3>

          {saved && (
            <div className="pref-saved-banner-stitch">
              <CheckCircle size={14} />
              <span>Preferences updated!</span>
            </div>
          )}

          <div className="checkbox-list-stitch">
            <div className="checkbox-item-stitch">
              <input
                type="checkbox"
                id="pref-email"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
              />
              <label htmlFor="pref-email">
                <span className="ch-lbl">Email Notifications</span>
                <span className="ch-desc">Receive mail alerts on dispatch progress and work resolution.</span>
              </label>
            </div>

            <div className="checkbox-item-stitch">
              <input
                type="checkbox"
                id="pref-sms"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
              />
              <label htmlFor="pref-sms">
                <span className="ch-lbl">SMS Alert System</span>
                <span className="ch-desc">Get text alerts directly on assignments of ground crew.</span>
              </label>
            </div>

            <div className="checkbox-item-stitch">
              <input
                type="checkbox"
                id="pref-app"
                checked={inAppAlerts}
                onChange={e => setInAppAlerts(e.target.checked)}
              />
              <label htmlFor="pref-app">
                <span className="ch-lbl">Bell badge flags</span>
                <span className="ch-desc">Alert dot on top navigation bar headers.</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={saving}>
            <Save size={14} />
            <span>{saving ? 'Saving changes...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>

      {/* Sign Out triggers */}
      <button onClick={logout} className="btn btn-secondary btn-logout-bottom-stitch animate-fade-in">
        <LogOut size={16} />
        <span>Log out of account</span>
      </button>

      <style jsx>{`
        .profile-header-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-top-row-stitch {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-avatar-large-stitch {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          overflow: hidden;
          border: 2px solid white;
          box-shadow: var(--shadow-md);
        }

        .profile-avatar-large-stitch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-titles-stitch {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .name-badge-row-stitch {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .profile-name-stitch-large {
          font-size: 22px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        .verified-resident-badge-stitch {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
        }

        .profile-email-sub-stitch {
          font-size: 13.5px;
          color: var(--muted);
        }

        /* Stats grid styles */
        .profile-stats-grid-stitch {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background-color: var(--background);
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          padding: 16px;
          text-align: center;
        }

        .p-stat-widget-stitch {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-right: 1px solid var(--card-border);
        }

        .p-stat-widget-stitch:last-child {
          border-right: none;
        }

        .p-stat-val-stitch {
          font-size: 20px;
          font-weight: 800;
          color: var(--foreground);
        }

        .p-stat-lbl-stitch {
          font-size: 11px;
          color: var(--muted);
          font-weight: 700;
        }

        /* Settings columns split */
        .profile-settings-split-stitch {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 24px;
        }

        @media (max-width: 800px) {
          .profile-settings-split-stitch {
            grid-template-columns: 1fr;
          }
        }

        .settings-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-card-title-stitch {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 10px;
        }

        .settings-card-title-stitch :global(svg) {
          color: var(--primary);
        }

        .account-details-rows-stitch {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .acc-info-row-stitch {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .a-lbl {
          font-weight: 600;
          color: var(--muted);
        }

        .a-val {
          font-weight: 700;
          color: var(--foreground);
        }

        /* Notification preference checkboxes */
        .pref-panel {
          height: fit-content;
        }

        .pref-saved-banner-stitch {
          background-color: var(--priority-low-bg);
          color: var(--priority-low);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .checkbox-list-stitch {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 6px;
        }

        .checkbox-item-stitch {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .checkbox-item-stitch input {
          width: 16px;
          height: 16px;
          margin-top: 3px;
          cursor: pointer;
        }

        .checkbox-item-stitch label {
          margin-bottom: 0;
          cursor: pointer;
        }

        .ch-lbl {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--foreground);
        }

        .ch-desc {
          display: block;
          font-size: 11px;
          color: var(--muted);
          line-height: 1.4;
        }

        /* Logout button style */
        .btn-logout-bottom-stitch {
          width: 100%;
          justify-content: center;
          padding: 12px;
          background-color: var(--priority-high-bg) !important;
          color: var(--priority-high) !important;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .btn-logout-bottom-stitch:hover {
          background-color: var(--priority-high) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

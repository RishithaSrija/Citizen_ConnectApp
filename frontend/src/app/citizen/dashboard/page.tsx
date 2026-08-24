'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  Building2,
  PhoneCall,
  ChevronRight,
  Bell,
  Map
} from 'lucide-react';
import { Complaint } from '@/lib/db';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const data = await res.json();
          setComplaints(data.complaints || []);
        }
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  const activeCount = complaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;

  // Mock static thumbnails mapping categories to visual placeholders
  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'Roads':
        return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=120';
      case 'Street Lights':
      case 'Electricity':
        return 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=120';
      case 'Water Supply':
        return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=120';
      case 'Sanitation':
        return 'https://images.unsplash.com/photo-1616979266853-9307bdf10e6e?auto=format&fit=crop&q=80&w=120';
      default:
        return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=120';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'In Progress') {
      return { color: '#165DFF', backgroundColor: 'rgba(22, 93, 255, 0.08)' };
    }
    if (status === 'Under Review') {
      return { color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' };
    }
    return { color: '#57E3A5', backgroundColor: 'rgba(87, 227, 165, 0.08)' };
  };

  return (
    <div className="dashboard-stitch animate-fade-in">
      {/* Top Greeting & Search Header */}
      <div className="dashboard-greet-section">
        <h1 className="greet-title">Good morning, {user?.name.split(' ')[0] || 'Alex'}</h1>
      </div>

      {/* Global Search Bar */}
      <div className="search-bar-container-stitch">
        <Search className="search-icon-stitch" size={18} />
        <input
          type="text"
          placeholder="Search civic issues or locations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats Cards Row */}
      <div className="stats-pills-row">
        <div className="stats-pill-card green-pill">
          <div className="pill-icon-box green">
            <CheckCircle size={16} />
          </div>
          <div className="pill-info">
            <span className="pill-count">{resolvedCount || 3} Resolved</span>
            <span className="pill-sub">This month</span>
          </div>
        </div>

        <div className="stats-pill-card blue-pill">
          <div className="pill-icon-box blue">
            <AlertCircle size={16} />
          </div>
          <div className="pill-info">
            <span className="pill-count">{activeCount || 1} Active Report</span>
            <span className="pill-sub">Update pending</span>
          </div>
        </div>
      </div>

      {/* AI Insight Box Banner */}
      <div className="ai-insight-banner-stitch">
        <div className="banner-logo-row">
          <div className="banner-spark-circle">
            <Sparkles size={16} />
          </div>
          <span className="banner-ai-tag">AI INSIGHT</span>
        </div>
        <p className="banner-message">
          Road repairs on Main St are <strong>80% complete</strong>. Local access restored by 5 PM today.
        </p>
        <button className="btn btn-primary banner-details-btn" onClick={() => router.push('/citizen/track')}>
          View details
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h3 className="section-header-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link href="/citizen/report" className="action-circle-link">
            <div className="circle-icon green-circle">
              <Plus size={22} />
            </div>
            <span>Report</span>
          </Link>
          <Link href="/citizen/map" className="action-circle-link">
            <div className="circle-icon blue-circle">
              <Map size={22} />
            </div>
            <span>Map</span>
          </Link>
          <Link href="/citizen/track" className="action-circle-link">
            <div className="circle-icon purple-circle">
              <Building2 size={20} />
            </div>
            <span>Depts</span>
          </Link>
          <a href="tel:+15550100" className="action-circle-link">
            <div className="circle-icon red-circle">
              <PhoneCall size={20} />
            </div>
            <span>Emergency</span>
          </a>
        </div>
      </div>

      {/* Two Column Splits */}
      <div className="dashboard-columns-split">
        {/* Left Column: My Recent Reports */}
        <div className="recent-reports-column">
          <div className="column-header-row">
            <h3 className="section-header-title">My Recent Reports</h3>
            <Link href="/citizen/track" className="header-explore-link">
              <span>See all</span>
            </Link>
          </div>
          
          <div className="reports-list-stitch">
            {loading ? (
              <div className="report-loader-box">
                <div className="map-spinner" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="empty-reports-box-stitch">
                <p>No reports filed yet. Tap the button below to start.</p>
              </div>
            ) : (
              complaints.slice(0, 3).map((comp) => (
                <div key={comp.id} className="report-card-stitch" onClick={() => router.push(`/citizen/track?id=${comp.id}`)}>
                  <div className="report-card-main">
                    <div className="report-card-thumb">
                      <img src={getCategoryImage(comp.category)} alt="Thumb" />
                    </div>
                    <div className="report-card-details">
                      <div className="card-title-badge-row">
                        <h4>{comp.title}</h4>
                        <span className="card-status-badge-stitch" style={getStatusStyle(comp.status)}>
                          {comp.status}
                        </span>
                      </div>
                      <span className="card-meta-stitch">
                        Reported {new Date(comp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ID: #{comp.id.split('-')[1] || comp.id}
                      </span>
                      {comp.aiSummary && (
                        <div className="card-ai-bubble-stitch">
                          <Sparkles size={11} className="sparkle-blue" />
                          <span>AI: {comp.aiSummary.summary.split('.')[0]}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Nearby Activity */}
        <div className="nearby-activity-column">
          <div className="column-header-row">
            <h3 className="section-header-title">Nearby Activity</h3>
            <Link href="/citizen/map" className="header-explore-link">
              <span>Explore</span>
            </Link>
          </div>

          <div className="nearby-map-card-stitch">
            <div className="nearby-map-canvas-mock" onClick={() => router.push('/citizen/map')}>
              {/* Styled Mock Coordinate Dot pins representing the design map */}
              <div className="mock-map-marker red-marker" style={{ top: '35%', left: '30%' }}>
                <span className="marker-dot-center" />
              </div>
              <div className="mock-map-marker blue-marker" style={{ top: '60%', left: '70%' }}>
                <span className="marker-dot-center" />
              </div>
              <div className="mock-map-marker green-marker" style={{ top: '75%', left: '50%' }}>
                <span className="marker-dot-center" />
              </div>
            </div>
            
            {/* Map Overlay bottom bar banner */}
            <div className="nearby-map-banner-stitch" onClick={() => router.push('/citizen/map')}>
              <div className="banner-left-info">
                <span className="map-banner-title">12 Nearby Issues</span>
                <span className="map-banner-desc">4 resolved in the last 24h</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--muted)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <Link href="/citizen/report" className="floating-add-btn-stitch">
        <Plus size={24} />
      </Link>

      <style jsx>{`
        .dashboard-greet-section {
          margin-bottom: 12px;
        }

        .greet-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.03em;
        }

        .search-bar-container-stitch {
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }

        .search-bar-container-stitch input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          background-color: var(--card);
          color: var(--foreground);
          font-size: 14px;
          outline: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .search-icon-stitch {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }

        .stats-pills-row {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .stats-pill-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          background-color: var(--card);
        }

        .green-pill {
          border-left: 4px solid var(--accent);
        }

        .blue-pill {
          border-left: 4px solid var(--primary);
        }

        .pill-icon-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pill-icon-box.green {
          background-color: var(--accent-light);
          color: var(--accent);
        }

        .pill-icon-box.blue {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .pill-info {
          display: flex;
          flex-direction: column;
        }

        .pill-count {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
        }

        .pill-sub {
          font-size: 11px;
          color: var(--muted);
        }

        /* AI Insight Banner styling */
        .ai-insight-banner-stitch {
          background: linear-gradient(135deg, #0045e0 0%, #165DFF 100%);
          border-radius: var(--radius-md);
          padding: 20px;
          color: white;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(22, 93, 255, 0.15);
        }

        .ai-insight-banner-stitch::after {
          content: '';
          position: absolute;
          right: -20px;
          bottom: -20px;
          width: 120px;
          height: 120px;
          background-color: rgba(255,255,255,0.03);
          border-radius: var(--radius-full);
          pointer-events: none;
        }

        .banner-logo-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .banner-spark-circle {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background-color: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-ai-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .banner-message {
          font-size: 13.5px;
          line-height: 1.5;
          color: rgba(255,255,255,0.9);
          margin-bottom: 12px;
        }

        .banner-details-btn {
          background-color: rgba(255,255,255,0.15) !important;
          color: white !important;
          border: none;
          padding: 6px 14px;
          font-size: 12px;
          box-shadow: none;
          width: fit-content;
        }

        .banner-details-btn:hover {
          background-color: rgba(255,255,255,0.25) !important;
        }

        /* Quick Actions styling */
        .quick-actions-section {
          margin-bottom: 28px;
        }

        .section-header-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--foreground);
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .action-circle-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .action-circle-link span {
          font-size: 12px;
          font-weight: 600;
          color: var(--foreground);
        }

        .circle-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .circle-icon:hover {
          transform: translateY(-2px);
        }

        .green-circle { background-color: #E2FBF0; color: #10B981; }
        .blue-circle { background-color: #E6F0FF; color: #165DFF; }
        .purple-circle { background-color: #F3E8FF; color: #8B5CF6; }
        .red-circle { background-color: #FEE2E2; color: #EF4444; }

        /* Splits styling */
        .dashboard-columns-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        @media (max-width: 900px) {
          .dashboard-columns-split {
            grid-template-columns: 1fr;
          }
        }

        .column-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .header-explore-link {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
        }

        .reports-list-stitch {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .report-card-stitch:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .report-card-main {
          display: flex;
          gap: 14px;
        }

        .report-card-thumb {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
        }

        .report-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .report-card-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .card-title-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .card-title-badge-row h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
        }

        .card-status-badge-stitch {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .card-meta-stitch {
          font-size: 11px;
          color: var(--muted);
        }

        .card-ai-bubble-stitch {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          background-color: rgba(22, 93, 255, 0.03);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
        }

        .card-ai-bubble-stitch span {
          font-size: 11px;
          color: var(--primary);
          font-weight: 600;
        }

        .sparkle-blue {
          color: var(--primary);
        }

        .report-loader-box {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-reports-box-stitch {
          border: 2px dashed var(--card-border);
          border-radius: var(--radius-md);
          padding: 32px 16px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }

        /* Nearby map styles */
        .nearby-map-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          height: calc(100% - 36px);
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }

        .nearby-map-canvas-mock {
          flex: 1;
          background: radial-gradient(circle, #e2e8f0 10%, #cbd5e1 90%);
          position: relative;
          cursor: pointer;
          min-height: 180px;
        }

        .mock-map-marker {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .mock-map-marker::before {
          content: '';
          position: absolute;
          bottom: -6px;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 6px solid white;
        }

        .marker-dot-center {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: white;
        }

        .red-marker { background-color: #EF4444; }
        .blue-marker { background-color: #165DFF; }
        .green-marker { background-color: #10B981; }

        .nearby-map-banner-stitch {
          padding: 12px 16px;
          background-color: var(--card);
          border-top: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .banner-left-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .map-banner-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--foreground);
        }

        .map-banner-desc {
          font-size: 11px;
          color: var(--muted);
        }

        /* Floating Add Action */
        .floating-add-btn-stitch {
          position: fixed;
          bottom: 80px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background-color: #10B981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          transition: transform var(--transition-fast);
          z-index: 25;
        }

        .floating-add-btn-stitch:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .floating-add-btn-stitch {
            bottom: 84px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
}

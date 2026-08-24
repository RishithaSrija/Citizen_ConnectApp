'use client';

import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import MapContainer from '@/components/MapContainer';
import { FileText, Clock, CheckCircle, BarChart3, AlertCircle, Map } from 'lucide-react';
import { Complaint, Department } from '@/lib/db';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [compRes, deptRes] = await Promise.all([
          fetch('/api/complaints'),
          fetch('/api/complaints?all=true') // We can call list complaints endpoint. Since user is admin, backend returns all complaints anyway!
        ]);

        if (compRes.ok) {
          const compData = await compRes.json();
          setComplaints(compData.complaints || []);
        }

        // Mock loading departments since they are static in DB
        const depts = [
          { id: 'dept-roads', name: 'Roads Department', description: 'Handles potholes, paving.', color: '#3b82f6' },
          { id: 'dept-water', name: 'Water Department', description: 'Manages leaks, drainage.', color: '#06b6d4' },
          { id: 'dept-electricity', name: 'Electricity Department', description: 'Maintains streetlights.', color: '#f59e0b' },
          { id: 'dept-sanitation', name: 'Municipal Sanitation', description: 'Deals with waste.', color: '#10b981' },
          { id: 'dept-publicworks', name: 'Public Works', description: 'Maintains parks.', color: '#8b5cf6' },
          { id: 'dept-environment', name: 'Environment Department', description: 'Addresses pollution.', color: '#059669' }
        ];
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).length;
  const progressCount = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length;
  const completedCount = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;

  // Calculate category stats
  const categoryCounts: { [key: string]: number } = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categorySorted = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Department counts
  const getDeptPerformance = (deptName: string) => {
    const deptComplaints = complaints.filter(c => c.department === deptName);
    const resolved = deptComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const rate = deptComplaints.length > 0 ? Math.round((resolved / deptComplaints.length) * 100) : 0;
    return {
      total: deptComplaints.length,
      resolved,
      rate
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Reports Received"
          value={totalCount}
          icon={<FileText size={22} />}
          accentColor="var(--primary)"
          subtitle="Lifetime grievances filed"
        />
        <MetricCard
          title="Pending Assessment"
          value={pendingCount}
          icon={<Clock size={22} />}
          accentColor="var(--priority-high)"
          subtitle="Awaiting review routing"
        />
        <MetricCard
          title="Resolution Active"
          value={progressCount}
          icon={<BarChart3 size={22} />}
          accentColor="var(--priority-medium)"
          subtitle="Work orders in progress"
        />
        <MetricCard
          title="Resolved Cases"
          value={completedCount}
          icon={<CheckCircle size={22} />}
          accentColor="var(--status-resolved)"
          subtitle="Successfully finalized"
        />
      </div>

      {/* Analytics Splits */}
      <div className="admin-dashboard-layout">
        {/* Left Column: Charts and Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Category Distribution Chart */}
          <div className="admin-panel-card">
            <h3>Grievance Category Frequency</h3>
            <div className="chart-container-panel">
              {loading ? (
                <div className="panel-loader-placeholder">
                  <div className="map-spinner" />
                </div>
              ) : totalCount === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>No reports recorded yet.</p>
              ) : (
                <div className="horizontal-bar-chart">
                  {categorySorted.map(([cat, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={cat} className="bar-row animate-fade-in">
                        <div className="bar-label-group">
                          <span className="bar-label">{cat}</span>
                          <span className="bar-val">{count} ({pct}%)</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Department performance table */}
          <div className="admin-panel-card">
            <h3>Department Staff Load & Resolution Rates</h3>
            <div className="custom-table-container" style={{ border: 'none', boxShadow: 'none' }}>
              {loading ? (
                <div className="panel-loader-placeholder" style={{ padding: '32px' }}>
                  <div className="map-spinner" />
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Tickets Routed</th>
                      <th>Resolved</th>
                      <th>Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => {
                      const perf = getDeptPerformance(dept.name);
                      return (
                        <tr key={dept.id}>
                          <td style={{ fontWeight: 700, color: 'var(--foreground)' }}>{dept.name}</td>
                          <td>{perf.total}</td>
                          <td>{perf.resolved}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="rate-bar-track">
                                <div className="rate-bar-fill" style={{ width: `${perf.rate}%`, backgroundColor: dept.color }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '12px' }}>{perf.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hotspot Map */}
        <div className="admin-panel-card map-panel-card">
          <div className="map-panel-header">
            <Map size={18} style={{ color: 'var(--primary)' }} />
            <h3>Geographic Incident Hotspots</h3>
          </div>
          <p className="map-panel-desc">Real-time status clustering of citizen reports across the municipal limits.</p>
          <div style={{ marginTop: '16px', flex: 1, minHeight: '400px' }}>
            {loading ? (
              <div className="panel-loader-placeholder">
                <div className="map-spinner" />
              </div>
            ) : (
              <MapContainer complaints={complaints} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .admin-dashboard-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .admin-dashboard-layout {
            grid-template-columns: 1fr;
          }
        }

        .admin-panel-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
        }

        .admin-panel-card h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 16px;
        }

        .panel-loader-placeholder {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* CSS Chart elements */
        .horizontal-bar-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bar-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bar-label-group {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 700;
        }

        .bar-label {
          color: var(--foreground);
        }

        .bar-val {
          color: var(--muted);
        }

        .bar-track {
          height: 8px;
          background-color: var(--muted-light);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: var(--radius-full);
          transition: width 0.8s ease-in-out;
        }

        /* Performance table items */
        .rate-bar-track {
          width: 80px;
          height: 6px;
          background-color: var(--muted-light);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .rate-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
        }

        /* Map Panel details */
        .map-panel-card {
          min-height: 580px;
        }

        .map-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .map-panel-header h3 {
          margin-bottom: 0;
        }

        .map-panel-desc {
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

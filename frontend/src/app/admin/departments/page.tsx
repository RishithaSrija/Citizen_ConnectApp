'use client';

import React, { useState, useEffect } from 'react';
import { Building, ClipboardCheck, Users, Briefcase, Plus, Sparkles } from 'lucide-react';
import { Complaint } from '@/lib/db';

export default function AdminDepartments() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, []);

  const departmentsList = [
    { name: 'Roads Department', description: 'Handles potholes, paving, overlays, and lane markers.', staff: 14, color: '#3b82f6' },
    { name: 'Water Department', description: 'Manages water utility piping, leaks, flooding drainage, and sewer backups.', staff: 18, color: '#06b6d4' },
    { name: 'Electricity Department', description: 'Maintains block streetlights, faulty transformers, and power cable outages.', staff: 12, color: '#f59e0b' },
    { name: 'Municipal Sanitation', description: 'Waste collections, public littering cleanup, and community bins.', staff: 24, color: '#10b981' },
    { name: 'Public Works', description: 'Signage maintenance, park overrides, and public structural safety inspection.', staff: 9, color: '#8b5cf6' },
    { name: 'Environment Department', description: 'Industrial noise violations, tree trimming, pest control, and air quality.', staff: 7, color: '#059669' }
  ];

  const getDeptActiveCount = (deptName: string) => {
    return complaints.filter(c => c.department === deptName && ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  };

  const getDeptResolvedCount = (deptName: string) => {
    return complaints.filter(c => c.department === deptName && ['Resolved', 'Closed'].includes(c.status)).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div className="dept-intro-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Municipal Departments Overview</h1>
          <p style={{ marginTop: '4px' }}>Review active staffing thresholds, ticket routing rules, and department workloads.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Option to add department is disabled in mock MVP.')} style={{ gap: '6px' }}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {departmentsList.map((dept, idx) => {
          const activeCount = getDeptActiveCount(dept.name);
          const resolvedCount = getDeptResolvedCount(dept.name);
          
          return (
            <div key={idx} className="admin-panel-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: dept.color }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>{dept.name}</h3>
                <Building size={16} style={{ color: dept.color }} />
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.4', flex: 1 }}>{dept.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Tasks</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--foreground)' }}>
                    {loading ? '...' : activeCount}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Staff Available</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--foreground)' }}>{dept.staff} Crews</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
                <span>Lifetime Resolved: {loading ? '...' : resolvedCount}</span>
                <span style={{ color: dept.color }}>Route Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

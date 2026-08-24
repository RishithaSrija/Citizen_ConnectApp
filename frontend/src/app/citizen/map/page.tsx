'use client';

import React, { useState, useEffect } from 'react';
import MapContainer from '@/components/MapContainer';
import { Filter, MapPin, Sparkles } from 'lucide-react';
import { Complaint } from '@/lib/db';

const CATEGORIES = ['All', 'Roads', 'Water Supply', 'Electricity', 'Sanitation', 'Street Lights', 'Public Safety', 'Environment', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function CitizenMap() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Active filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const data = await res.json();
          setComplaints(data.complaints || []);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Description */}
      <div className="map-intro">
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Nearby Grievance Mapping</h1>
        <p style={{ marginTop: '4px' }}>Visualise the location of your reported complaints. Filter markers by status and category for targeted tracking.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="map-filters-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Filter Markers</span>
        </div>

        <div className="filters-selectors">
          <div className="filter-select-group">
            <label htmlFor="cat-filter">Category</label>
            <select
              id="cat-filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <label htmlFor="stat-filter">Resolution Status</label>
            <select
              id="stat-filter"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Display Card */}
      <div className="map-display-container">
        {loading ? (
          <div className="map-loading-placeholder">
            <div className="map-spinner" />
            <p>Gathering geopins...</p>
          </div>
        ) : (
          <MapContainer
            complaints={complaints}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
          />
        )}
      </div>

      {/* Legend Indicator info */}
      <div className="map-legend-card animate-fade-in">
        <span className="legend-title">Marker Legend Indicators:</span>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot red" />
            <span>Unassigned (Submitted / Review)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot blue" />
            <span>In Hand (Assigned / In Progress)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot green" />
            <span>Completed (Resolved / Closed)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .map-filters-toolbar {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }

        .filters-selectors {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select-group label {
          margin-bottom: 0;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
        }

        .filter-select-group select {
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }

        .map-display-container {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .map-loading-placeholder {
          height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .map-legend-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: var(--shadow-sm);
        }

        .legend-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground);
        }

        .legend-items {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--muted);
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          border: 1px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .legend-dot.red { background-color: #ef4444; }
        .legend-dot.blue { background-color: #6366f1; }
        .legend-dot.green { background-color: #10b981; }
      `}</style>
    </div>
  );
}

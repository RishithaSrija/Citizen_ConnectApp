'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Search, Filter, Edit, Clock, Briefcase, User, MapPin, X, AlertCircle, Save, Sparkles } from 'lucide-react';
import { Complaint, Department } from '@/lib/db';

const DEPARTMENTS = [
  'Roads Department',
  'Water Department',
  'Electricity Department',
  'Municipal Sanitation',
  'Public Works',
  'Environment Department'
];

const STATUSES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal Detail State
  const [selectedComp, setSelectedComp] = useState<Complaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit fields inside modal
  const [editStatus, setEditStatus] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadComplaints = async () => {
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
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const openDetailsModal = (comp: Complaint) => {
    setSelectedComp(comp);
    setEditStatus(comp.status);
    setEditDept(comp.department);
    setEditPriority(comp.priority);
    setEditTime(comp.estimatedResolutionTime || '');
    setEditNotes(comp.internalNotes || '');
    setError('');
    setModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedComp(null);
    setModalOpen(false);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;

    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/complaints/${selectedComp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          department: editDept,
          priority: editPriority,
          estimatedResolutionTime: editTime,
          internalNotes: editNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update ticket details');
      }

      // Update local state list
      const updated = data.complaint;
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
      
      setSaving(false);
      closeDetailsModal();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
      setSaving(false);
    }
  };

  // Run searches
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.id.toLowerCase().includes(search.toLowerCase()) || 
                          c.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Control Panel: Search & Filters */}
      <div className="admin-controls-card">
        {/* Search */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Title, or Landmark..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filter-selects">
          <div className="filter-group">
            <label htmlFor="status-select">Status</label>
            <select id="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="cat-select">Category</label>
            <select id="cat-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Roads">Roads</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Environment">Environment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table Display */}
      <div className="admin-table-panel">
        {loading ? (
          <div className="table-loader-placeholder">
            <div className="map-spinner" />
            <p>Loading grievance files...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="table-loader-placeholder empty">
            <AlertCircle size={40} style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>No matching grievance tickets found</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Try modifying your filters or query text.</p>
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title / Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assigned Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '12.5px' }}>{c.id}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{c.title}</span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{c.location}</span>
                      </div>
                    </td>
                    <td><span className="table-cat-tag">{c.category}</span></td>
                    <td><StatusBadge value={c.priority} type="priority" /></td>
                    <td><span style={{ fontSize: '13px', fontWeight: 600 }}>{c.department}</span></td>
                    <td><StatusBadge value={c.status} type="status" /></td>
                    <td>
                      <button onClick={() => openDetailsModal(c)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <Edit size={14} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay Detail Drawer */}
      {modalOpen && selectedComp && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <span className="modal-ticket-id">Manage Ticket: {selectedComp.id}</span>
                <h3 className="modal-title">{selectedComp.title}</h3>
              </div>
              <button onClick={closeDetailsModal} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSaveChanges} className="modal-form-scroll">
              {error && (
                <div className="form-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-grid-split">
                {/* Left side: Information review */}
                <div className="modal-left-details">
                  <div className="info-review-group">
                    <h4>Reporter Profile</h4>
                    <div className="info-review-rows">
                      <div className="info-row"><User size={14} /><span>Name: {selectedComp.userName}</span></div>
                      <div className="info-row"><MapPin size={14} /><span>Landmark: {selectedComp.location}</span></div>
                      <div className="info-row"><Clock size={14} /><span>Filed: {new Date(selectedComp.createdAt).toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="info-review-group">
                    <h4>Description</h4>
                    <p className="modal-desc-text">{selectedComp.description}</p>
                  </div>

                  {/* AI Assistance insights */}
                  {selectedComp.aiSummary && (
                    <div className="info-review-group ai-insight-box">
                      <div className="ai-insight-header">
                        <Sparkles size={14} />
                        <span>AI Diagnostic Diagnostics</span>
                      </div>
                      <p className="ai-insight-summary">"{selectedComp.aiSummary.summary}"</p>
                      <div className="ai-insight-meta">
                        <span className="a-meta">Rec Category: <strong>{selectedComp.aiSummary.category}</strong></span>
                        <span className="a-meta">Rec Dept: <strong>{selectedComp.aiSummary.recommendedDepartment}</strong></span>
                        <span className="a-meta">Priority: <strong>{selectedComp.aiSummary.priority}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedComp.images && selectedComp.images.length > 0 && (
                    <div className="info-review-group">
                      <h4>Attachments</h4>
                      <div className="modal-images">
                        {selectedComp.images.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noreferrer">
                            <img src={img} alt="attachment" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Management Actions */}
                <div className="modal-right-actions">
                  <div className="action-form-group">
                    <label htmlFor="modal-status">Change Status</label>
                    <select id="modal-status" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="action-form-group">
                    <label htmlFor="modal-dept">Override / Assign Department</label>
                    <select id="modal-dept" value={editDept} onChange={e => setEditDept(e.target.value)}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="action-form-group">
                    <label htmlFor="modal-priority">Ticket Priority</label>
                    <select id="modal-priority" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="action-form-group">
                    <label htmlFor="modal-time">Estimated Resolution Time</label>
                    <input
                      type="text"
                      id="modal-time"
                      placeholder="e.g., 3 days, 1 week, 4 hours"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                    />
                  </div>

                  <div className="action-form-group">
                    <label htmlFor="modal-notes">Internal Notes & Timeline Updates</label>
                    <textarea
                      id="modal-notes"
                      rows={4}
                      placeholder="Add update notes visible to the citizen timeline..."
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="modal-actions-footer">
                <button type="button" className="btn btn-outline" onClick={closeDetailsModal}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving changes...' : 'Save Ticket Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-controls-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          box-shadow: var(--shadow-sm);
        }

        .search-bar-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        .search-bar-wrapper input {
          padding-left: 40px;
        }

        .filter-selects {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          margin-bottom: 0;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
        }

        .filter-group select {
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }

        .admin-table-panel {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .table-loader-placeholder {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--muted);
        }

        .table-loader-placeholder.empty {
          border: 2px dashed var(--muted-light);
          border-radius: var(--radius-lg);
          margin: 20px;
        }

        .table-cat-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--muted);
          padding: 2px 8px;
          background-color: var(--muted-light);
          border-radius: var(--radius-sm);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: calc(100vh - 40px);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 28px;
          background-color: var(--card-hover);
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-ticket-id {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--foreground);
        }

        .btn-close-modal {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-full);
          transition: background-color var(--transition-fast);
        }

        .btn-close-modal:hover {
          background-color: var(--muted-light);
          color: var(--foreground);
        }

        .modal-form-scroll {
          padding: 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: calc(100vh - 160px);
        }

        .modal-grid-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 28px;
        }

        @media (max-width: 800px) {
          .modal-grid-split {
            grid-template-columns: 1fr;
          }
        }

        .modal-left-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-review-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 16px;
        }

        .info-review-group:last-child {
          border-bottom: none;
        }

        .info-review-group h4 {
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .info-review-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--foreground);
          font-weight: 600;
        }

        .info-row :global(svg) {
          color: var(--primary);
        }

        .modal-desc-text {
          font-size: 13.5px;
          color: var(--foreground);
          line-height: 1.5;
        }

        .ai-insight-box {
          background-color: rgba(99, 102, 241, 0.04);
          border: 1px dashed rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .ai-insight-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
        }

        .ai-insight-summary {
          font-size: 12.5px;
          font-style: italic;
          color: var(--foreground);
          line-height: 1.4;
          margin-top: 6px;
        }

        .ai-insight-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 10px;
          font-size: 11px;
          color: var(--muted);
        }

        .modal-images {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-images img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--card-border);
        }

        .modal-right-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: var(--card-hover);
          padding: 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
        }

        .action-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .modal-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--card-border);
          padding-top: 20px;
          margin-top: 10px;
        }

        .form-error-banner {
          background-color: var(--priority-high-bg);
          color: var(--priority-high);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Plus, Sparkles, MapPin, Briefcase, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Complaint } from '@/lib/db';

export default function TrackGrievance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  
  // Accordion expanded card IDs
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadComplaints() {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const data = await res.json();
          const list = data.complaints || [];
          setComplaints(list);
          
          // Auto expand target ID if provided
          if (targetId) {
            setExpandedIds([targetId]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [targetId]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCloseComplaint = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to close ticket');
      }

      setComplaints(prev => prev.map(c => c.id === id ? data.complaint : c));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStitchCategoryTag = (category: string) => {
    switch (category) {
      case 'Roads':
        return 'Infrastructure';
      case 'Water Supply':
      case 'Electricity':
      case 'Street Lights':
        return 'Utilities';
      case 'Sanitation':
      case 'Environment':
        return 'Public Space';
      default:
        return 'General';
    }
  };

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

  // Run filters
  const filtered = complaints.filter(c => {
    if (filter === 'Resolved') {
      return ['Resolved', 'Closed'].includes(c.status);
    }
    if (filter === 'Open') {
      return ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status);
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header section */}
      <div className="track-header-row-stitch">
        <div className="track-header-titles">
          <h1 className="track-title-stitch">Issue Tracking</h1>
          <p className="track-sub-stitch">Monitor the progress of your submitted civic reports.</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/citizen/report')} style={{ padding: '10px 18px', gap: '6px' }}>
          <Plus size={16} />
          <span>New Report</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="track-filter-toolbar-stitch">
        <button className={`filter-tab-btn-stitch ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
          All
        </button>
        <button className={`filter-tab-btn-stitch ${filter === 'Open' ? 'active' : ''}`} onClick={() => setFilter('Open')}>
          Open
        </button>
        <button className={`filter-tab-btn-stitch ${filter === 'Resolved' ? 'active' : ''}`} onClick={() => setFilter('Resolved')}>
          Resolved
        </button>
      </div>

      {error && (
        <div className="form-error-banner animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Issues feed index */}
      <div className="track-feed-list-stitch">
        {loading ? (
          <div className="loader-box-stitch">
            <div className="map-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-feed-box-stitch">
            <p>No complaints match your current filter.</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isExpanded = expandedIds.includes(c.id);
            const statusIdx = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'].indexOf(c.status);
            
            // Check steps active indexes
            const step1Done = statusIdx >= 0;
            const step2Done = statusIdx >= 1;
            const step3Done = statusIdx >= 2; // Assigned or later
            const step4Done = statusIdx >= 4; // Resolved or Closed

            const step3Active = c.status === 'Assigned' || c.status === 'In Progress';
            const step4Active = c.status === 'Resolved';

            return (
              <div key={c.id} className="track-card-stitch" onClick={() => toggleExpand(c.id)}>
                <div className="card-top-summary-stitch">
                  <div className="card-thumb-stitch">
                    <img src={getCategoryImage(c.category)} alt="Thumbnail" />
                  </div>
                  
                  <div className="card-body-details-stitch">
                    <div className="card-badge-row-stitch">
                      <span className="card-category-tag-stitch">{getStitchCategoryTag(c.category)}</span>
                      <span className="card-id-text-stitch">ID: #{c.id.split('-')[1] || c.id}</span>
                      <div className="card-chevron-stitch">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    <h3 className="card-title-text-stitch">{c.title}</h3>

                    {/* Progress Nodes timeline grid */}
                    <div className="card-progress-stepper-stitch">
                      <div className="stepper-nodes-line">
                        <div className="line-connector" style={{ width: step4Done ? '100%' : step3Done ? '66%' : step2Done ? '33%' : '0%' }} />
                      </div>
                      
                      <div className="stepper-nodes-row">
                        {/* Node 1: Submitted */}
                        <div className="stepper-node">
                          <div className={`node-circle ${step1Done ? 'done' : ''}`}>
                            <Check size={10} />
                          </div>
                          <span className={`node-label ${step1Done ? 'active' : ''}`}>Submitted</span>
                        </div>

                        {/* Node 2: Review */}
                        <div className="stepper-node">
                          <div className={`node-circle ${step2Done ? 'done' : ''}`}>
                            {step2Done ? <Check size={10} /> : null}
                          </div>
                          <span className={`node-label ${step2Done ? 'active' : ''}`}>Review</span>
                        </div>

                        {/* Node 3: Dispatched */}
                        <div className="stepper-node">
                          <div className={`node-circle ${step4Done ? 'done' : step3Active ? 'inprogress' : ''}`}>
                            {step4Done ? <Check size={10} /> : step3Active ? <span className="inner-dot-stitch" /> : null}
                          </div>
                          <span className={`node-label ${step3Done ? 'active' : ''}`}>Dispatched</span>
                        </div>

                        {/* Node 4: Resolved */}
                        <div className="stepper-node">
                          <div className={`node-circle ${step4Done ? 'done' : step4Active ? 'inprogress' : ''}`}>
                            {step4Done ? <Check size={10} /> : step4Active ? <span className="inner-dot-stitch" /> : null}
                          </div>
                          <span className={`node-label ${step4Done ? 'active' : ''}`}>Resolved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Accordion details inside card */}
                {isExpanded && (
                  <div className="card-expanded-drawer-stitch animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="expanded-details-grid-stitch">
                      
                      {/* Left: details log */}
                      <div className="expanded-log-details">
                        <div className="exp-meta-group">
                          <span className="exp-lbl"><MapPin size={12} /><span>Location Address</span></span>
                          <span className="exp-val">{c.location}</span>
                        </div>
                        
                        <div className="exp-meta-group">
                          <span className="exp-lbl"><Briefcase size={12} /><span>Assigned Department</span></span>
                          <span className="exp-val">{c.department}</span>
                        </div>

                        <div className="exp-meta-group">
                          <span className="exp-lbl"><Clock size={12} /><span>Estimated Resolution Time</span></span>
                          <span className="exp-val">{c.estimatedResolutionTime || 'Awaiting dispatch details'}</span>
                        </div>

                        <div className="exp-meta-group">
                          <span className="exp-lbl"><Calendar size={12} /><span>Timeline details</span></span>
                          <span className="exp-val">Submitted on {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Right: Notes */}
                      <div className="expanded-notes-details">
                        <h4 className="notes-header-stitch">Grievance Description</h4>
                        <p className="description-p-stitch">{c.description}</p>
                        
                        {c.aiSummary && (
                          <div className="ai-digest-box-stitch">
                            <div className="ai-title-stitch">
                              <Sparkles size={11} />
                              <span>AI DIGEST REPORT</span>
                            </div>
                            <p className="ai-text-stitch">"{c.aiSummary.summary}"</p>
                          </div>
                        )}

                        {c.internalNotes && (
                          <div className="admin-timeline-notes-stitch">
                            <span className="notes-tag-stitch">Staff Update Notes:</span>
                            <p className="notes-p-stitch">"{c.internalNotes}"</p>
                          </div>
                        )}

                        {c.status === 'Resolved' && (
                          <button
                            onClick={(e) => handleCloseComplaint(c.id, e)}
                            className="btn btn-primary btn-close-ticket-stitch"
                            disabled={updatingId === c.id}
                          >
                            <span>{updatingId === c.id ? 'Archiving...' : 'Close Ticket & Confirm'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .track-header-row-stitch {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .track-title-stitch {
          font-size: 26px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        .track-sub-stitch {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
          margin-top: 4px;
        }

        /* Filter Toolbar */
        .track-filter-toolbar-stitch {
          display: flex;
          background-color: #F1F5F9;
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
          width: fit-content;
        }

        .filter-tab-btn-stitch {
          background: none;
          border: none;
          padding: 6px 20px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-tab-btn-stitch.active {
          background-color: var(--card);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .track-feed-list-stitch {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .loader-box-stitch {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-feed-box-stitch {
          border: 2px dashed var(--card-border);
          border-radius: var(--radius-md);
          padding: 40px 16px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }

        .track-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .track-card-stitch:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .card-top-summary-stitch {
          display: flex;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .card-top-summary-stitch {
            flex-direction: column;
            gap: 12px;
          }
        }

        .card-thumb-stitch {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--card-border);
        }

        .card-thumb-stitch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-body-details-stitch {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-badge-row-stitch {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .card-category-tag-stitch {
          font-size: 11px;
          font-weight: 800;
          color: #10B981;
          background-color: #E2FBF0;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .card-id-text-stitch {
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }

        .card-chevron-stitch {
          margin-left: auto;
          color: var(--muted);
        }

        .card-title-text-stitch {
          font-size: 16px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }

        /* Stepper nodes styling */
        .card-progress-stepper-stitch {
          position: relative;
          width: 100%;
          padding-top: 6px;
        }

        .stepper-nodes-line {
          position: absolute;
          left: 10px;
          right: 10px;
          top: 13px;
          height: 2px;
          background-color: var(--card-border);
          z-index: 1;
        }

        .line-connector {
          height: 100%;
          background-color: var(--primary);
          transition: width 0.4s ease;
        }

        .stepper-nodes-row {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .stepper-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .node-circle {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background-color: var(--card);
          border: 2px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 8px;
          transition: all var(--transition-fast);
        }

        .node-circle.done {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .node-circle.inprogress {
          border-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inner-dot-stitch {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: var(--primary);
        }

        .node-label {
          font-size: 10px;
          color: var(--muted);
          font-weight: 700;
        }

        .node-label.active {
          color: var(--foreground);
        }

        /* Accordion Expanded drawer */
        .card-expanded-drawer-stitch {
          border-top: 1px solid var(--card-border);
          margin-top: 16px;
          padding-top: 16px;
          cursor: default;
        }

        .expanded-details-grid-stitch {
          display: grid;
          grid-template-columns: 1.2fr 1.5fr;
          gap: 24px;
        }

        @media (max-width: 800px) {
          .expanded-details-grid-stitch {
            grid-template-columns: 1fr;
          }
        }

        .expanded-log-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-right: 1px solid var(--card-border);
          padding-right: 16px;
        }

        @media (max-width: 800px) {
          .expanded-log-details {
            border-right: none;
            padding-right: 0;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 16px;
          }
        }

        .exp-meta-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .exp-lbl {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
        }

        .exp-lbl :global(svg) {
          color: var(--primary);
        }

        .exp-val {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--foreground);
        }

        .expanded-notes-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notes-header-stitch {
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
        }

        .description-p-stitch {
          font-size: 13.5px;
          color: var(--foreground);
          line-height: 1.5;
        }

        .ai-digest-box-stitch {
          background-color: rgba(22, 93, 255, 0.03);
          border: 1px dashed rgba(22, 93, 255, 0.25);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ai-title-stitch {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.02em;
        }

        .ai-text-stitch {
          font-size: 12.5px;
          font-style: italic;
          color: var(--foreground);
        }

        .admin-timeline-notes-stitch {
          background-color: var(--card-hover);
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
        }

        .notes-tag-stitch {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--foreground);
        }

        .notes-p-stitch {
          font-size: 12.5px;
          color: var(--muted);
          line-height: 1.4;
          margin-top: 2px;
        }

        .btn-close-ticket-stitch {
          background-color: var(--status-resolved) !important;
          color: white !important;
          padding: 8px 14px;
          font-size: 12.5px;
          width: fit-content;
        }

        .btn-close-ticket-stitch:hover {
          background-color: hsl(142, 76%, 30%) !important;
        }

        .form-error-banner {
          background-color: var(--priority-high-bg);
          color: var(--priority-high);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

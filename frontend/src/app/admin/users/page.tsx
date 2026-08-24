'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '@/lib/db';

export default function AdminUsers() {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'suspended') => {
    setError('');
    setUpdatingId(userId);
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile status');
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not change user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Toolbar */}
      <div className="admin-controls-card">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search accounts by Name, Email, or User ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="form-error-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Users table */}
      <div className="admin-table-panel">
        {loading ? (
          <div className="table-loader-placeholder">
            <div className="map-spinner" />
            <p>Loading member credentials...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="table-loader-placeholder empty">
            <AlertCircle size={40} style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>No user accounts matched your query</p>
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Registered Date</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Manage Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id}>
                      <td style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)' }}>{u.id}</td>
                      <td style={{ fontWeight: 700, color: 'var(--foreground)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {isAdmin ? <ShieldCheck size={12} /> : null}
                          <span>{u.role.toUpperCase()}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`user-status-dot ${u.status}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {isAdmin ? (
                          <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--muted)' }}>Administrative Lock</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            disabled={updatingId === u.id}
                            className={`btn ${isSuspended ? 'btn-primary' : 'btn-danger btn-suspend'}`}
                            style={{ padding: '6px 12px', fontSize: '12px', width: '110px' }}
                          >
                            {updatingId === u.id ? (
                              'Updating...'
                            ) : isSuspended ? (
                              <>
                                <UserCheck size={14} />
                                <span>Unsuspend</span>
                              </>
                            ) : (
                              <>
                                <UserX size={14} />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-controls-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 20px 24px;
          display: flex;
          box-shadow: var(--shadow-sm);
        }

        .search-bar-wrapper {
          position: relative;
          width: 100%;
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

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .role-badge.admin {
          color: var(--primary);
          background-color: var(--primary-light);
        }

        .role-badge.citizen {
          color: var(--muted);
          background-color: var(--muted-light);
        }

        .user-status-dot {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          gap: 6px;
        }

        .user-status-dot::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          display: inline-block;
        }

        .user-status-dot.active {
          color: var(--priority-low);
        }

        .user-status-dot.active::before {
          background-color: var(--priority-low);
        }

        .user-status-dot.suspended {
          color: var(--priority-high);
        }

        .user-status-dot.suspended::before {
          background-color: var(--priority-high);
        }

        .btn-suspend {
          background-color: transparent;
          color: hsl(0, 84%, 60%);
          border: 1px solid hsl(0, 84%, 85%);
        }

        .btn-suspend:hover {
          background-color: hsl(0, 84%, 96%);
          border-color: hsl(0, 84%, 60%);
          color: hsl(0, 84%, 55%);
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

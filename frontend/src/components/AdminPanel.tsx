import React, { useEffect, useState } from 'react';
import { SystemStats, User, UserRole } from '../types';
import { userApi } from '../services/api';
import {
  Users,
  FolderGit2,
  FileText,
  HardDrive,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData] = await Promise.all([
        userApi.getStats(),
        userApi.getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const updated = await userApi.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    setUpdatingId(userId);
    try {
      const updated = await userApi.toggleStatus(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert('Failed to toggle status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    setUpdatingId(userId);
    try {
      await userApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      loadData();
    } catch (err: any) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={26} color="#c084fc" /> Admin Oversight & System Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 2 }}>
            Manage user authorization, review platform metrics, and control system-wide settings.
          </p>
        </div>
        <button onClick={loadData} disabled={loading} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Metrics
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 8,
          padding: '12px 16px',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 2 }}>{stats.totalUsers}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderGit2 size={24} color="#22d3ee" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Projects</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 2 }}>{stats.totalProjects}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Knowledge Files</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 2 }}>{stats.totalDocuments}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={24} color="#c084fc" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disk Storage</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 2 }}>{stats.formattedStorage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>User Accounts & Roles</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 14px' }}>ID</th>
                <th style={{ padding: '12px 14px' }}>Full Name</th>
                <th style={{ padding: '12px 14px' }}>Email Address</th>
                <th style={{ padding: '12px 14px' }}>System Role</th>
                <th style={{ padding: '12px 14px' }}>Account Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                  }}
                >
                  <td style={{ padding: '12px 14px', color: '#6b7280' }}>#{u.id}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.fullName}</td>
                  <td style={{ padding: '12px 14px', color: '#93c5fd' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      className="input-field"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    >
                      <option value="ROLE_ADMIN">ADMIN</option>
                      <option value="ROLE_OWNER">OWNER</option>
                      <option value="ROLE_USER">USER</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      disabled={updatingId === u.id}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    >
                      {u.enabled ? (
                        <>
                          <CheckCircle size={14} color="#34d399" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} color="#fb7185" /> Disabled
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={updatingId === u.id}
                      className="btn btn-danger btn-sm"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

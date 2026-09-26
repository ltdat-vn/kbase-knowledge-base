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
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu quản trị hệ thống');
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
      alert('Cập nhật vai trò thất bại: ' + (err.response?.data?.message || err.message));
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
      alert('Thay đổi trạng thái thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản người dùng này không?')) return;
    setUpdatingId(userId);
    try {
      await userApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      loadData();
    } catch (err: any) {
      alert('Xóa tài khoản thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={22} color="#7c3aed" /> Giám Sát & Quản Trị Hệ Thống Toàn Diện
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
            Quản trị tài khoản, ủy quyền vai trò, giám sát tài nguyên lưu trữ và thông số nền tảng.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ height: 36 }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Làm Mới Dữ Liệu
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="white-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Tổng Người Dùng
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0f172a', marginTop: 2 }}>
                {stats.totalUsers}
              </div>
            </div>
          </div>

          <div className="white-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderGit2 size={22} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Tổng Dự Án
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0f172a', marginTop: 2 }}>
                {stats.totalProjects}
              </div>
            </div>
          </div>

          <div className="white-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Tệp Tài Liệu
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0f172a', marginTop: 2 }}>
                {stats.totalDocuments}
              </div>
            </div>
          </div>

          <div className="white-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={22} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Dung Lượng Lưu Trữ
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0f172a', marginTop: 2 }}>
                {stats.formattedStorage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaecf0' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            Danh Sách Tài Khoản & Phân Quyền Người Dùng
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã ID</th>
                <th>Họ và Tên</th>
                <th>Địa Chỉ Email</th>
                <th>Vai Trò Hệ Thống</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.fullName}</td>
                  <td style={{ color: '#4338ca', fontSize: '0.82rem' }}>{u.email}</td>
                  <td>
                    <select
                      className="input-field"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto', borderRadius: 6 }}
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    >
                      <option value="ROLE_ADMIN">Quản Trị Viên (Admin)</option>
                      <option value="ROLE_OWNER">Chủ Dự Án (Owner)</option>
                      <option value="ROLE_USER">Người Dùng (User)</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      disabled={updatingId === u.id}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                    >
                      {u.enabled ? (
                        <>
                          <CheckCircle size={13} color="#10b981" /> Hoạt Động
                        </>
                      ) : (
                        <>
                          <XCircle size={13} color="#ef4444" /> Đã Khóa
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={updatingId === u.id}
                      className="btn btn-danger btn-sm"
                      title="Xóa tài khoản người dùng"
                      style={{ padding: '4px 8px', borderRadius: 6 }}
                    >
                      <Trash2 size={13} />
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

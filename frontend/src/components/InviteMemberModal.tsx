import React, { useState } from 'react';
import { UserPlus, X, AlertCircle } from 'lucide-react';
import { projectApi } from '../services/api';
import { ProjectMember } from '../types';

interface InviteMemberModalProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (member: ProjectMember) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  onMemberAdded,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const newMember = await projectApi.inviteMember(projectId, email.trim(), role);
      onMemberAdded(newMember);
      onClose();
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể mời thành viên. Hãy đảm bảo tài khoản người dùng đã đăng ký trên hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 30, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserPlus size={22} color="#06b6d4" /> Mời Thành Viên Tham Gia {projectName}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>
          Thêm đồng đội vào không gian dự án bằng địa chỉ email đã đăng ký tài khoản.
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Địa Chỉ Email Người Dùng *</label>
            <input
              type="email"
              required
              placeholder="Ví dụ: engineer@kbase.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Vai Trò Trong Dự Án</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MEMBER">Thành viên (Tải tài liệu, xem & hỏi đáp trợ lý AI)</option>
              <option value="VIEWER">Người xem (Chỉ xem & tải tài liệu)</option>
              <option value="OWNER">Đồng quản trị (Toàn quyền quản lý tài liệu & thành viên)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={loading || !email.trim()} className="btn btn-primary">
              {loading ? 'Đang gửi lời mời...' : 'Thêm Thành Viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

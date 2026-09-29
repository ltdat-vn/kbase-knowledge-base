import React, { useState } from 'react';
import { UserPlus, X, AlertCircle } from 'lucide-react';
import { projectApi } from '../../services/api';
import { ProjectMember } from '../../types';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          padding: 28,
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
            }}
          >
            <UserPlus size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Mời Thành Viên Vào {projectName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Thêm đồng đội vào không gian dự án bằng địa chỉ email.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: '0.82rem',
              margin: '14px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Địa Chỉ Email Người Dùng *
            </label>
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
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Vai Trò Trong Dự Án
            </label>
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

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn btn-black-pill"
              style={{ height: 38 }}
            >
              {loading ? 'Đang gửi lời mời...' : 'Thêm Thành Viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

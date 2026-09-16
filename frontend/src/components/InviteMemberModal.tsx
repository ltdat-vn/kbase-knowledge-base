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
      setError(err.response?.data?.message || err.message || 'Failed to invite member. Make sure user exists in system.');
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
          <UserPlus size={22} color="#06b6d4" /> Invite Member to {projectName}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>
          Add a registered teammate by their registered email address.
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>User Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. user@kbase.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Project Role</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MEMBER">Member (Can upload, view & ask AI)</option>
              <option value="VIEWER">Viewer (Can read & download files)</option>
              <option value="OWNER">Co-Owner (Full project management)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !email.trim()} className="btn btn-primary">
              {loading ? 'Inviting...' : 'Invite Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

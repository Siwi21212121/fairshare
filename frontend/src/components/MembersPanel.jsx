import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import {
  inviteMember,
  listInvitations,
  revokeInvitation,
  updateMemberRole,
} from '../api/groups';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

function roleLabel(role) {
  return role === 'OWNER' ? 'Owner' : role === 'EDITOR' ? 'Editor' : 'Viewer';
}

export default function MembersPanel({ group, onChanged }) {
  const { user } = useAuth();
  const isOwner = group.currentUserRole === 'OWNER' || group.createdBy === user?.id;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !isOwner) return;
    listInvitations(group.id).then(setInvitations).catch(() => setInvitations([]));
  }, [open, group.id, isOwner]);

  async function sendInvite(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setInviteUrl('');
    setLoading(true);
    try {
      const result = await inviteMember(group.id, email, role);
      setMessage(result.message || 'Invitation created.');
      if (result.inviteUrl) setInviteUrl(result.inviteUrl);
      setEmail('');
      setInvitations((current) => [result.invitation, ...current]);
    } catch (err) {
      setError(errorMessage(err, 'Could not send invitation'));
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(memberId, nextRole) {
    try {
      await updateMemberRole(group.id, memberId, nextRole);
      onChanged?.();
    } catch (err) {
      setError(errorMessage(err, 'Could not change role'));
    }
  }

  async function revoke(id) {
    try {
      await revokeInvitation(group.id, id);
      setInvitations((current) => current.filter((i) => i.id !== id));
    } catch (err) {
      setError(errorMessage(err, 'Could not revoke invitation'));
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 18, marginTop: 24 }}>
        <div className="section-title-row">
          <h2 style={{ fontSize: 16 }}>Members</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{group.members.length} people</span>
            {isOwner && <Button size="sm" onClick={() => { setOpen(true); setError(''); setMessage(''); }}>+ Invite</Button>}
          </div>
        </div>

        <div className="stack" style={{ marginTop: 12 }}>
          {group.members.map((member) => (
            <div key={member.id} className="exp-row">
              <div className="left">
                <div className="avatar sm">{member.initial}</div>
                <div className="meta">
                  <b>{member.displayName}{member.userId === user?.id ? ' (you)' : ''}</b>
                  <small>{member.user?.email || 'Added manually'}</small>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isOwner && member.userId !== user?.id ? (
                  <select
                    className="input"
                    style={{ width: 120, padding: '7px 9px' }}
                    value={member.role || 'EDITOR'}
                    onChange={(e) => changeRole(member.id, e.target.value)}
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                ) : (
                  <span className="chip">{roleLabel(member.userId === user?.id && isOwner ? 'OWNER' : member.role)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Invite people to ${group.name}`}>
        <form className="stack" onSubmit={sendInvite}>
          <div className="field">
            <label>Email address</label>
            <input
              className="input"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Permission</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="EDITOR">Editor — can add and manage expenses</option>
              <option value="VIEWER">Viewer — can only view</option>
            </select>
          </div>

          <div className="hint-text">
            The invitation expires after 7 days and can only be accepted by an account using this email.
          </div>

          {error && <div className="banner-error">{error}</div>}
          {message && <div className="banner-success">{message}</div>}
          {inviteUrl && (
            <div className="card" style={{ padding: 12 }}>
              <div className="hint-text" style={{ marginBottom: 6 }}>Local test invite link (shown because email sending is not configured):</div>
              <div style={{ wordBreak: 'break-all', fontSize: 12 }}>{inviteUrl}</div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                style={{ marginTop: 8 }}
                onClick={() => navigator.clipboard?.writeText(inviteUrl)}
              >
                Copy link
              </Button>
            </div>
          )}

          <Button type="submit" loading={loading}>Send Invitation</Button>
        </form>

        {invitations.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="section-title-row"><h2 style={{ fontSize: 15 }}>Pending invitations</h2></div>
            <div className="stack" style={{ marginTop: 10 }}>
              {invitations.map((inv) => (
                <div key={inv.id} className="exp-row">
                  <div className="left">
                    <div className="meta">
                      <b>{inv.email}</b>
                      <small>{roleLabel(inv.role)} · expires {new Date(inv.expiresAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => revoke(inv.id)}>Revoke</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

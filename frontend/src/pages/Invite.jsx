import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { acceptInvitation, getInvitation } from '../api/groups';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Invite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    getInvitation(token)
      .then(setInvitation)
      .catch((err) => setError(errorMessage(err, 'This invitation could not be found.')));
  }, [token]);

  async function handleAccept() {
    setError('');
    setAccepting(true);
    try {
      const result = await acceptInvitation(token);
      navigate(`/groups/${result.groupId}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not accept invitation'));
    } finally {
      setAccepting(false);
    }
  }

  if (authLoading || !invitation) {
    return (
      <div className="auth-shell">
        <div className="auth-box card">
          {error ? <div className="banner-error">{error}</div> : <Loading label="Loading invitation…" />}
        </div>
      </div>
    );
  }

  const from = { pathname: `/invite/${token}` };
  const role = invitation.role === 'EDITOR' ? 'Editor' : 'Viewer';

  return (
    <div className="auth-shell">
      <div className="auth-box card">
        <div className="auth-head">
          <Logo />
          <h2>{invitation.group?.name}</h2>
          <p>{invitation.invitedBy?.name} invited you to join this FairShare trip as a <strong>{role}</strong>.</p>
        </div>

        {error && <div className="banner-error">{error}</div>}

        {invitation.status !== 'PENDING' ? (
          <div className="banner-error">This invitation is {invitation.status.toLowerCase()}.</div>
        ) : user ? (
          <>
            {user.email.toLowerCase() !== invitation.email.toLowerCase() && (
              <div className="banner-error">
                This invitation was sent to {invitation.email}. You're logged in as {user.email}.
              </div>
            )}
            <Button
              block
              loading={accepting}
              disabled={user.email.toLowerCase() !== invitation.email.toLowerCase()}
              onClick={handleAccept}
            >
              Accept Invitation
            </Button>
          </>
        ) : (
          <div className="stack">
            <div className="hint-text" style={{ textAlign: 'center' }}>
              Invitation for <strong>{invitation.email}</strong>
            </div>
            <Link to="/login" state={{ from }} style={{ textDecoration: 'none' }}>
              <Button block>Log in to accept</Button>
            </Link>
            <Link to="/signup" state={{ from }} style={{ textDecoration: 'none' }}>
              <Button block variant="ghost">Create account</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

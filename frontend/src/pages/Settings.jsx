import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <div className="stack" style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Profile</h3>
          <div className="stack">
            <div className="field">
              <label>Name</label>
              <input className="input" value={user?.name || ''} disabled />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" value={user?.email || ''} disabled />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Preferences</h3>
          <div className="field">
            <label>Default currency</label>
            <select className="input" defaultValue="INR">
              <option value="INR">₹ Indian Rupee</option>
              <option value="USD">$ US Dollar</option>
              <option value="EUR">€ Euro</option>
            </select>
          </div>
          <div className="hint-text" style={{ marginTop: 8 }}>
            This sets the default when creating a new split. Each group's currency is fixed once created.
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Account</h3>
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

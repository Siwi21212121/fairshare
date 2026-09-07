import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { createGroup, addMember } from '../api/groups';
import { errorMessage } from '../api/client';

const TYPES = [
  { key: 'trip', label: 'Trip', icon: <path d="M2 12l8-2 5-8 2 1-3 7 6-1 2 2-7 3-2 6-2-1 1-6z" /> },
  { key: 'dinner', label: 'Dinner', icon: <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 3c-2 0-3 2-3 4s1 4 3 4v10" /> },
  { key: 'home', label: 'Home', icon: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> },
  { key: 'event', label: 'Event', icon: <path d="M3.5 5h17v15h-17zM3.5 9.5h17M8 3v4M16 3v4" /> },
  { key: 'other', label: 'Something else', icon: <circle cx="12" cy="12" r="1.8" /> },
];

const DEFAULT_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

export default function NewSplit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState('trip');
  const [count, setCount] = useState(10);
  const [groupName, setGroupName] = useState('Goa Trip');
  const [currency, setCurrency] = useState('INR');
  const [memberNames, setMemberNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function goToStep4() {
    // Member 1 is always "you" (the account holder), created automatically
    // by the backend when the group is made — so this list covers the rest.
    const extra = Math.max(count - 1, 0);
    setMemberNames(DEFAULT_NAMES.slice(0, extra));
    setStep(4);
  }

  async function handleCreateGroup() {
    setError('');
    if (!groupName.trim()) {
      setError('Please give your group a name.');
      return;
    }
    const cleanNames = memberNames.map((n) => n.trim()).filter(Boolean);
    setSubmitting(true);
    try {
      const group = await createGroup({ name: groupName.trim(), type, currency });
      for (const name of cleanNames) {
        await addMember(group.id, name);
      }
      navigate(`/groups/${group.id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create group'));
      setSubmitting(false);
    }
  }

  return (
    <div className="wizard-shell">
      <Logo />
      <div className="wizard-steps">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`wizard-dot ${s === step ? 'active' : s < step ? 'done' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="wizard-card card">
          <h2>What are you splitting?</h2>
          <div className="opt-grid">
            {TYPES.map((t) => (
              <div
                key={t.key}
                className={`opt-card ${type === t.key ? 'selected' : ''}`}
                onClick={() => setType(t.key)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
          <div className="wizard-actions">
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-card card">
          <h2>How many people?</h2>
          <div className="num-stepper">
            <button onClick={() => setCount((c) => Math.max(2, c - 1))}>−</button>
            <div className="num-display">{count}</div>
            <button onClick={() => setCount((c) => Math.min(15, c + 1))}>+</button>
          </div>
          <div className="wizard-actions">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-card card">
          <h2>Create your group</h2>
          <div className="stack" style={{ width: '100%', textAlign: 'left' }}>
            <div className="field">
              <label>Group name</label>
              <input className="input" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Goa Trip" />
            </div>
            <div className="field">
              <label>Currency</label>
              <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">₹ Indian Rupee</option>
                <option value="USD">$ US Dollar</option>
                <option value="EUR">€ Euro</option>
              </select>
            </div>
          </div>
          {error && <div className="banner-error" style={{ width: '100%' }}>{error}</div>}
          <div className="wizard-actions">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={goToStep4}>Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="wizard-card card">
          <h2>Who's involved?</h2>
          <p className="hint-text">You're already in — name the other {memberNames.length} people in this group.</p>
          <div className="member-name-grid">
            {memberNames.map((name, idx) => (
              <div className="member-name-row" key={idx}>
                <div className="avatar sm">{(name || '?').charAt(0).toUpperCase()}</div>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => {
                    const next = [...memberNames];
                    next[idx] = e.target.value;
                    setMemberNames(next);
                  }}
                />
              </div>
            ))}
          </div>
          {error && <div className="banner-error" style={{ width: '100%' }}>{error}</div>}
          <div className="wizard-actions">
            <Button variant="ghost" onClick={() => setStep(3)} disabled={submitting}>
              Back
            </Button>
            <Button onClick={handleCreateGroup} loading={submitting}>
              Create {groupName || 'group'} →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

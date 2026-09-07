import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGroups } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Loading from '../components/Loading';
import SummaryCard from '../components/SummaryCard';
import { formatINR } from '../utils/format';

const typeEmoji = { trip: '🏖', dinner: '🍽', home: '🏠', event: '🎂', other: '✨' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listGroups()
      .then(setGroups)
      .catch(() => setError('Could not load your groups.'));
  }, []);

  if (error) return <div className="banner-error">{error}</div>;
  if (!groups) return <Loading label="Loading your dashboard…" />;

  const totalOwe = groups.reduce((s, g) => s + g.youOwe, 0);
  const totalOwed = groups.reduce((s, g) => s + g.youAreOwed, 0);
  const totalSpent = groups.reduce((s, g) => s + g.totalExpenses, 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="greet">Good to see you 👋</div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        </div>
        <Button onClick={() => navigate('/new-split')}>+ New Split</Button>
      </div>

      <div className="summary-row" style={{ marginBottom: 24 }}>
        <SummaryCard label="Total you owe" value={totalOwe} tone="neg" />
        <SummaryCard label="Total you're owed" value={totalOwed} tone="pos" />
        <SummaryCard label="Total spent across groups" value={totalSpent} />
      </div>

      <div className="section-title-row">
        <h2 style={{ fontSize: 17 }}>Your groups</h2>
        <span>{groups.length} total</span>
      </div>

      {groups.length === 0 ? (
        <div className="empty-row">
          <div>You're not part of any splits yet.</div>
          <div>Create your first group and add an expense to get started.</div>
          <Button size="sm" onClick={() => navigate('/new-split')}>
            + New Split
          </Button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((g) => (
            <div key={g.id} className="group-card card" onClick={() => navigate(`/groups/${g.id}`)}>
              <div className="g-top">
                <h3>
                  {typeEmoji[g.type] || '✨'} {g.name}
                </h3>
                <div className="chip">{g.peopleCount} people</div>
              </div>
              <div className="g-meta">{formatINR(g.totalExpenses)} total expenses</div>
              <div className="g-bal">
                {g.settled ? (
                  <>
                    <span className="lbl">Status</span>
                    <span className="val">Settled ✓</span>
                  </>
                ) : g.youAreOwed > 0 ? (
                  <>
                    <span className="lbl">You're owed</span>
                    <span className="val pos">{formatINR(g.youAreOwed)}</span>
                  </>
                ) : (
                  <>
                    <span className="lbl">You owe</span>
                    <span className="val neg">{formatINR(g.youOwe)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

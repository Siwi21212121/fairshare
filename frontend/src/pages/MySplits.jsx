import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGroups } from '../api/groups';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { formatINR } from '../utils/format';

const typeEmoji = { trip: '🏖', dinner: '🍽', home: '🏠', event: '🎂', other: '✨' };
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'trip', label: 'Trips' },
  { key: 'dinner', label: 'Food' },
  { key: 'home', label: 'Home' },
  { key: 'event', label: 'Events' },
];

export default function MySplits() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    listGroups()
      .then(setGroups)
      .catch(() => setError('Could not load your splits.'));
  }, []);

  if (error) return <div className="banner-error">{error}</div>;
  if (!groups) return <Loading label="Loading your splits…" />;

  const filtered = filter === 'all' ? groups : groups.filter((g) => g.type === filter);

  return (
    <div>
      <div className="page-head">
        <h1>My Splits</h1>
        <Button onClick={() => navigate('/new-split')}>+ New Split</Button>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 22 }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-row">
          <div>No splits in this filter yet.</div>
        </div>
      ) : (
        <div className="groups-grid">
          {filtered.map((g) => (
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

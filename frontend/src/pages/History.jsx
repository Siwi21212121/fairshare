import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGroups } from '../api/groups';
import { listExpenses } from '../api/expenses';
import Loading from '../components/Loading';
import { formatINR, formatDate } from '../utils/format';

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const gs = await listGroups();
        setGroups(gs);
        const perGroup = await Promise.all(
          gs.map(async (g) => {
            const expenses = await listExpenses(g.id);
            return expenses.map((e) => ({ ...e, groupId: g.id, groupName: g.name }));
          })
        );
        const flat = perGroup.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(flat);
      } catch (err) {
        setError('Could not load history.');
      }
    }
    load();
  }, []);

  if (error) return <div className="banner-error">{error}</div>;
  if (!items) return <Loading label="Loading history…" />;

  const filtered = filter === 'all' ? items : items.filter((i) => i.groupId === filter);

  const monthGroups = filtered.reduce((acc, item) => {
    const key = new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-head">
        <h1>History</h1>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 22 }}>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All groups
        </button>
        {groups.map((g) => (
          <button key={g.id} className={`filter-tab ${filter === g.id ? 'active' : ''}`} onClick={() => setFilter(g.id)}>
            {g.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-row">
          <div>No expense history yet.</div>
          <div>Once you add expenses, they'll show up here.</div>
        </div>
      ) : (
        Object.entries(monthGroups).map(([month, list]) => (
          <div key={month} style={{ marginBottom: 22 }}>
            <div className="hint-text" style={{ marginBottom: 10 }}>
              {month}
            </div>
            <div className="stack">
              {list.map((e) => (
                <div
                  key={e.id}
                  className="exp-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/groups/${e.groupId}`)}
                >
                  <div className="left">
                    <div className="avatar sm">{e.paidBy?.initial}</div>
                    <div className="meta">
                      <b>{e.title}</b>
                      <small>
                        {e.groupName} · Paid by {e.paidBy?.displayName} · {e.participants.length} people ·{' '}
                        {formatDate(e.createdAt)}
                      </small>
                    </div>
                  </div>
                  <div className="amt">{formatINR(e.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

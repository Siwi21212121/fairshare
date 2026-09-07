import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGroup } from '../api/groups';
import { getBalances, getSettlements, deleteExpense } from '../api/expenses';
import Button from '../components/Button';
import Loading from '../components/Loading';
import SummaryCard from '../components/SummaryCard';
import ExpenseCard from '../components/ExpenseCard';
import BalancesView from './Balances';
import SettlementsView from './Settlements';
import ExpenseHistoryList from '../components/ExpenseHistoryList';
import MembersPanel from '../components/MembersPanel';
import { errorMessage } from '../api/client';

const typeEmoji = { trip: '🏖', dinner: '🍽', home: '🏠', event: '🎂', other: '✨' };
const TABS = ['Overview', 'Expenses', 'Balances', 'History'];

export default function GroupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [g, b, s] = await Promise.all([getGroup(id), getBalances(id), getSettlements(id)]);
      setGroup(g);
      setBalances(b);
      setSettlements(s);
    } catch (err) {
      setError(errorMessage(err, 'Could not load this group'));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteExpense(expenseId) {
    if (!window.confirm('Delete this expense? Balances and settlements will update.')) return;
    await deleteExpense(id, expenseId);
    load();
  }

  if (error) return <div className="banner-error">{error}</div>;
  if (!group) return <Loading label="Loading group…" />;

  const recent = group.expenses.slice(0, 5);
  const canEdit = group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR';

  return (
    <div>
      <div className="page-head">
        <div className="greet" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1>
            {typeEmoji[group.type] || '✨'} {group.name}
          </h1>
          <div className="chip">{group.members.length} people</div>
        </div>
        {canEdit && <Button onClick={() => navigate(`/groups/${id}/expenses/new`)}>+ Add Expense</Button>}
      </div>

      <div className="tabs" style={{ marginBottom: 22 }}>
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <SummaryCard size="stat" label="Total expenses" value={group.summary.totalExpenses} />
            <SummaryCard size="stat" label="You paid" value={group.summary.youPaid} />
            <SummaryCard size="stat" label="Your share" value={group.summary.yourShare} />
            <SummaryCard size="stat" label="You owe" value={group.summary.youOwe} tone={group.summary.youOwe > 0 ? 'neg' : undefined} />
            <SummaryCard
              size="stat"
              label="You're owed"
              value={group.summary.youAreOwed}
              tone={group.summary.youAreOwed > 0 ? 'pos' : undefined}
            />
          </div>

          <div className="section-title-row">
            <h2 style={{ fontSize: 16 }}>Recent expenses</h2>
            {group.expenses.length > 0 && <span>{group.expenses.length} total</span>}
          </div>

          {group.expenses.length === 0 ? (
            <div className="empty-row">
              <div>No expenses yet.</div>
              <div>Add your first expense and we'll handle the math.</div>
              {canEdit && <Button size="sm" onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                + Add Expense
              </Button>}
            </div>
          ) : (
            <div className="stack">
              {recent.map((e) => (
                <ExpenseCard key={e.id} expense={e} onClick={() => setTab('History')} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Expenses' && (
        <div className="stack">
          {group.expenses.length === 0 ? (
            <div className="empty-row">
              <div>No expenses yet.</div>
              <div>Add your first expense and we'll handle the math.</div>
              {canEdit && <Button size="sm" onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                + Add Expense
              </Button>}
            </div>
          ) : (
            group.expenses.map((e) => <ExpenseCard key={e.id} expense={e} onClick={() => setTab('History')} />)
          )}
        </div>
      )}

      {tab === 'Balances' && <BalancesView balances={balances} groupName={group.name} />}

      {tab === 'History' && (
        <ExpenseHistoryList
          expenses={group.expenses}
          onEdit={canEdit ? (expenseId) => navigate(`/groups/${id}/expenses/${expenseId}/edit`) : undefined}
          onDelete={canEdit ? handleDeleteExpense : undefined}
        />
      )}

      {tab === 'Overview' && settlements && settlements.settlements.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <SettlementsView settlements={settlements} groupName={group.name} expenses={group.expenses} members={group.members} />
        </div>
      )}

      <MembersPanel group={group} onChanged={load} />
    </div>
  );
}

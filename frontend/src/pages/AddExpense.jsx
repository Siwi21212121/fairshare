import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGroup } from '../api/groups';
import { createExpense, updateExpense, getExpense } from '../api/expenses';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import { formatINR } from '../utils/format';
import { errorMessage } from '../api/client';

export default function AddExpense() {
  const { id, expenseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(expenseId);

  const [members, setMembers] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedIds, setSelectedIds] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const group = await getGroup(id);
        setMembers(group.members);
        setGroupName(group.name);
        setPaidById((prev) => prev || group.members[0]?.id || '');

        if (isEditing) {
          const expense = await getExpense(id, expenseId);
          setTitle(expense.title);
          setAmount(String(expense.amount));
          setPaidById(expense.paidById);
          setSplitType(expense.splitType === 'unequal' ? 'unequal' : 'equal');
          setSelectedIds(expense.participants.map((p) => p.memberId));
          if (expense.splitType === 'unequal') {
            const map = {};
            expense.participants.forEach((p) => {
              map[p.memberId] = String(p.amount);
            });
            setCustomAmounts(map);
          }
        } else {
          setSelectedIds(group.members.map((m) => m.id));
        }
      } catch (err) {
        setLoadError(errorMessage(err, 'Could not load this group'));
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, expenseId]);

  const numericAmount = Number(amount) || 0;

  function toggleMember(memberId) {
    setSelectedIds((prev) => (prev.includes(memberId) ? prev.filter((x) => x !== memberId) : [...prev, memberId]));
  }

  const equalShare = selectedIds.length > 0 ? numericAmount / selectedIds.length : 0;

  const enteredTotal = useMemo(
    () => selectedIds.reduce((sum, mid) => sum + (Number(customAmounts[mid]) || 0), 0),
    [selectedIds, customAmounts]
  );
  const difference = Math.round((numericAmount - enteredTotal) * 100) / 100;
  const mismatch = splitType === 'unequal' && Math.abs(difference) > 0.01;

  function autoFixEqual() {
    // "Fix with groups" quick action: distribute the expense equally across
    // the currently selected participants as a starting point to edit from.
    const share = selectedIds.length > 0 ? numericAmount / selectedIds.length : 0;
    const next = {};
    selectedIds.forEach((mid) => {
      next[mid] = share.toFixed(2);
    });
    setCustomAmounts(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) return setSubmitError({ error: 'Expense title is required' });
    if (!numericAmount || numericAmount <= 0) return setSubmitError({ error: 'Amount must be greater than 0' });
    if (!paidById) return setSubmitError({ error: 'Please select who paid' });
    if (selectedIds.length === 0) return setSubmitError({ error: 'Select at least one participant' });
    if (mismatch) return setSubmitError({ error: "Your split doesn't add up" });

    const payload = {
      title: title.trim(),
      amount: numericAmount,
      paidById,
      splitType,
      participants:
        splitType === 'unequal'
          ? selectedIds.map((mid) => ({ memberId: mid, amount: Number(customAmounts[mid]) || 0 }))
          : selectedIds,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateExpense(id, expenseId, payload);
      } else {
        await createExpense(id, payload);
      }
      navigate(`/groups/${id}`);
    } catch (err) {
      const data = err?.response?.data;
      setSubmitError(data || { error: errorMessage(err, 'Failed to save expense') });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) return <div className="banner-error" style={{ margin: 24 }}>{loadError}</div>;
  if (!members) {
    return (
      <div className="wizard-shell">
        <Loading label="Loading expense form…" />
      </div>
    );
  }

  return (
    <div className="wizard-shell">
      <Logo />
      <div className="wizard-card card" style={{ maxWidth: 560, textAlign: 'left', alignItems: 'stretch' }}>
        <div className="modal-head">
          <h2 style={{ fontSize: 19 }}>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <div className="chip">{groupName}</div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Concert Tickets" />
          </div>

          <div className="field-row" style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Paid by</label>
              <select className="input" value={paidById} onChange={(e) => setPaidById(e.target.value)}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Amount</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="12000"
              />
            </div>
          </div>

          <div className="field">
            <label>Who was it for?</label>
            <div className="toggle-row">
              {members.map((m) => (
                <div
                  key={m.id}
                  className={`avatar sm selectable ${selectedIds.includes(m.id) ? 'selected' : ''}`}
                  onClick={() => toggleMember(m.id)}
                  title={m.displayName}
                >
                  {m.initial}
                </div>
              ))}
            </div>
            <span className="hint-text">{selectedIds.length} of {members.length} people selected</span>
          </div>

          <div className="field">
            <label>Split type</label>
            <div className="toggle-row">
              <button
                type="button"
                className={`toggle-pill ${splitType === 'equal' ? 'active' : ''}`}
                onClick={() => setSplitType('equal')}
              >
                Equal
              </button>
              <button
                type="button"
                className={`toggle-pill ${splitType === 'unequal' ? 'active' : ''}`}
                onClick={() => setSplitType('unequal')}
              >
                Unequal / Advanced
              </button>
            </div>
          </div>

          {splitType === 'equal' && numericAmount > 0 && selectedIds.length > 0 && (
            <div className="calc-box">
              <div className="calc-line">
                <span>
                  {title || 'Expense'} — {formatINR(numericAmount)}
                </span>
              </div>
              <div className="calc-line">
                <span>
                  {formatINR(numericAmount)} ÷ {selectedIds.length} {selectedIds.length === 1 ? 'person' : 'people'}
                </span>
                <b>{formatINR(equalShare)}</b>
              </div>
            </div>
          )}

          {splitType === 'unequal' && (
            <div className="field">
              <label>Custom amounts</label>
              <div className="stack">
                {selectedIds.map((mid) => {
                  const member = members.find((m) => m.id === mid);
                  return (
                    <div key={mid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar sm">{member?.initial}</div>
                      <span style={{ width: 80, fontSize: 13 }}>{member?.displayName}</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={customAmounts[mid] ?? ''}
                        onChange={(e) => setCustomAmounts({ ...customAmounts, [mid]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>

              {mismatch && (
                <div className="error-card" style={{ marginTop: 12 }}>
                  <div className="error-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l10 18H2z" />
                      <path d="M12 9v5M12 17.5h.01" />
                    </svg>
                    Your split doesn't add up
                  </div>
                  <div className="error-nums">
                    <div>
                      <small>Expected</small>
                      <b>{formatINR(numericAmount)}</b>
                    </div>
                    <div>
                      <small>Entered</small>
                      <b>{formatINR(enteredTotal)}</b>
                    </div>
                    <div>
                      <small>Difference</small>
                      <b style={{ color: 'var(--warn)' }}>{formatINR(Math.abs(difference))}</b>
                    </div>
                  </div>
                  <Button type="button" size="sm" onClick={autoFixEqual}>
                    Fix with equal split
                  </Button>
                </div>
              )}

              {!mismatch && numericAmount > 0 && enteredTotal > 0 && (
                <div className="banner-success" style={{ marginTop: 12 }}>
                  Your split adds up to {formatINR(enteredTotal)}.
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div className="banner-error">
              {submitError.error}
              {submitError.expected !== undefined && (
                <div style={{ marginTop: 6 }}>
                  Expected {formatINR(submitError.expected)}, entered {formatINR(submitError.entered)} (difference{' '}
                  {formatINR(Math.abs(submitError.difference))}).
                </div>
              )}
            </div>
          )}

          <div className="wizard-actions" style={{ justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(`/groups/${id}`)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={mismatch}>
              {isEditing ? 'Save Changes' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

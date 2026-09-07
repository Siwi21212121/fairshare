import { useState } from 'react';
import { formatINR, formatDate } from '../utils/format';
import Button from '../components/Button';

export default function ExpenseHistoryList({ expenses, onEdit, onDelete }) {
  const [openId, setOpenId] = useState(null);

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-row">
        <div>No expenses yet.</div>
        <div>Add your first expense and we'll handle the math.</div>
      </div>
    );
  }

  return (
    <div className="stack">
      {expenses.map((e) => {
        const isOpen = openId === e.id;
        return (
          <div key={e.id} className="card" style={{ padding: 15 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 12 }}
              onClick={() => setOpenId(isOpen ? null : e.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="avatar sm">{e.paidBy?.initial}</div>
                <div className="meta">
                  <b style={{ fontSize: 13.5 }}>{e.title}</b>
                  <div className="hint-text">
                    Paid by {e.paidBy?.displayName} · {e.participants.length} people · {formatDate(e.createdAt)}
                  </div>
                </div>
              </div>
              <div className="amt" style={{ fontFamily: 'var(--font-d)', fontWeight: 600 }}>
                {formatINR(e.amount)}
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div className="stack" style={{ marginBottom: 14 }}>
                  {e.participants.map((p) => (
                    <div className="bdown-line" key={p.id}>
                      <span>{p.member?.displayName}</span>
                      <span>{formatINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button size="sm" variant="ghost" onClick={() => onEdit?.(e.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete?.(e.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

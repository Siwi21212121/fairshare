import { useState } from 'react';
import { formatINR } from '../utils/format';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

function memberShareBreakdown(memberId, expenses) {
  return expenses
    .map((e) => {
      const p = e.participants.find((pp) => pp.memberId === memberId);
      if (!p) return null;
      return { title: e.title, paidByName: e.paidBy.displayName, amount: p.amount };
    })
    .filter(Boolean);
}

export default function SettlementsView({ settlements, groupName, expenses, members }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (!settlements) return null;
  const rows = settlements.settlements;

  if (rows.length === 0) {
    return (
      <div className="empty-row">
        <div>Everyone's settled up 🎉</div>
        <div>There are no outstanding payments in {groupName}.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title-row">
        <h2 style={{ fontSize: 16 }}>{groupName} — Who Pays Whom</h2>
        <div className="settle-count">{settlements.count} payments to settle everything</div>
      </div>
      <div className="stack">
        {rows.map((s, idx) => {
          const isOpen = openIdx === idx;
          const breakdown = expenses ? memberShareBreakdown(s.from.id, expenses) : [];
          const total = breakdown.reduce((sum, b) => sum + b.amount, 0);
          const rowsForSameFrom = rows.filter((r) => r.from.id === s.from.id).length;

          return (
            <div key={idx}>
              <div
                className="settle-row"
                style={isOpen ? { borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' } : undefined}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div className="settle-people">
                  <div className="avatar sm">{s.from.initial}</div>
                  <div className="settle-arrow">
                    <ArrowIcon />
                  </div>
                  <div className="avatar sm">{s.to.initial}</div>
                </div>
                <div className="settle-amt">{formatINR(s.amount)}</div>
              </div>

              {isOpen && (
                <div className="explain-panel card" style={{ marginTop: 8 }}>
                  <h4 style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 500 }}>
                    Why does {s.from.displayName} owe {s.to.displayName} {formatINR(s.amount)}?
                  </h4>
                  {breakdown.map((b, i) => (
                    <div className="bdown-line" key={i}>
                      <span>
                        {b.title} <small>— paid by {b.paidByName}</small>
                      </span>
                      <span>{formatINR(b.amount)}</span>
                    </div>
                  ))}
                  <div className="bdown-line total">
                    <span>{s.from.displayName}'s total share</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  <div className="explain-note">
                    {rowsForSameFrom > 1
                      ? `${s.from.displayName} owes money to more than one person, so this total is split across ${rowsForSameFrom} payments — this is one of them.`
                      : `FairShare consolidated everything ${s.from.displayName} owed across every expense into one practical payment: ${s.from.displayName} pays ${s.to.displayName} ${formatINR(s.amount)}.`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

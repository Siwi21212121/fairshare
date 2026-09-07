import { formatINR } from '../utils/format';

export default function BalancesView({ balances }) {
  if (!balances) return null;

  return (
    <div>
      <div className="section-title-row">
        <h2 style={{ fontSize: 16 }}>Net position</h2>
        <span>{balances.length} people</span>
      </div>
      <div className="balances-grid">
        {balances.map((b) => (
          <div key={b.memberId} className="balance-card card">
            <div className="avatar sm">{b.initial}</div>
            <div className="lbl">{b.status === 'gets' ? 'Gets' : b.status === 'owes' ? 'Owes' : 'Settled'}</div>
            <div className="val" style={{ color: b.status === 'gets' ? 'var(--pos)' : b.status === 'owes' ? 'var(--neg)' : 'var(--text)' }}>
              {formatINR(Math.abs(b.balance))}
            </div>
            <div className="hint-text">
              Paid {formatINR(b.paid)} · Share {formatINR(b.share)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

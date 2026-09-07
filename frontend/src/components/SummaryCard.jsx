import { formatINR } from '../utils/format';

export default function SummaryCard({ label, value, tone, isCurrency = true, size = 'summary' }) {
  const cls = size === 'stat' ? 'stat-card' : 'summary-card';
  return (
    <div className={`${cls} card`}>
      <div className="lbl">{label}</div>
      <div className={`val ${tone === 'pos' ? 'pos' : tone === 'neg' ? 'neg' : ''}`}>
        {isCurrency ? formatINR(value) : value}
      </div>
    </div>
  );
}

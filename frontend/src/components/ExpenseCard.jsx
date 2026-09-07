import MemberAvatar from './MemberAvatar';
import { formatINR, formatDate } from '../utils/format';

export default function ExpenseCard({ expense, onClick }) {
  return (
    <div className="exp-row" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="left">
        <MemberAvatar member={expense.paidBy} size="sm" />
        <div className="meta">
          <b>{expense.title}</b>
          <small>
            Paid by {expense.paidBy?.displayName} · {expense.participants?.length || 0} people ·{' '}
            {formatDate(expense.createdAt)}
          </small>
        </div>
      </div>
      <div className="amt">{formatINR(expense.amount)}</div>
    </div>
  );
}

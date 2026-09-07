export function formatINR(value) {
  const n = Number(value) || 0;
  const decimals = Math.round(n * 100) % 100 !== 0 ? 2 : 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initialOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

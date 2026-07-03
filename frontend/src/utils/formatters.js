export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatMonthYear(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function getMonthName(month) {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
}

export function toInputDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

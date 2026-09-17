/**
 * Formatting and data display utilities for Medora HMS
 */

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `Rs ${num.toLocaleString('en-US')}`;
}

export function parseCurrencyNumber(val) {
  return Number(String(val || 0).replace(/[^0-9.]/g, '')) || 0;
}

export function calculateAge(dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(1, age);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

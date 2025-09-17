// 📄 utils/formatting.js

export const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  export const formatFCFA = (n) =>
    Number.isFinite(n) ? `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA` : '';
  
  export const capitalizeWords = (s) =>
    typeof s === 'string' ? s.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : s;
  
  export const isBlank = (v) =>
    v == null || (typeof v === 'string' && v.trim() === '');
  
  // Normalize to a 10-digit CI number: strips +225/00225 and non-digits
  export function normalizePhoneCI(input) {
    if (!input) return null;
    const digits = String(input).replace(/\D/g, '');
    const trimmed = digits.replace(/^(225|00225)/, '');
    return /^\d{10}$/.test(trimmed) ? trimmed : null;
  }
  
  // ✅ NEW: always return the 10th of the relevant month
  // - If today (or base date) is after the 10th, return the 10th of next month
  // - Else return the 10th of this month
  export function dueDate10(base) {
    const d = base ? new Date(base) : new Date();
    if (Number.isNaN(d.getTime())) return new Date();
  
    let y = d.getFullYear();
    let m = d.getMonth(); // 0..11
    const day = d.getDate();
  
    if (day > 10) {
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
    return new Date(y, m, 10);
  }
  
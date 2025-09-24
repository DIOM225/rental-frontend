import PayRentButton from './PayRentButton';
import { formatFCFA } from '../utils/formatting';
import './RentBanner.css'; // ✅ important

function RentBanner({
  unitData,
  field,
  safeUnitCode,
  onAccepted,
  onRefused,
  onClosed
}) {
  const dueDay = unitData?.rentDueDate || 10;

  const today = new Date();
  let nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (today > nextDueDate) {
    nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  const prettyDueDate = nextDueDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dr = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));
  const bannerVariant = dr > 3 ? 'success' : dr >= 0 ? 'warning' : 'danger';

  const colors = {
    success: { bg: '#ecfdf5', border: '#bbf7d0', text: '#065f46' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  };

  const c = colors[bannerVariant];

  const statusLine =
    dr > 1
      ? `Paiement dans ${dr} jours`
      : dr === 1
      ? 'Paiement dans 1 jour'
      : dr === 0
      ? 'Paiement aujourd’hui'
      : `En retard de ${Math.abs(dr)} jours`;

  return (
    <div
      className="loye-banner"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        padding: '1.2rem',
        margin: '1rem 0 1.5rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <p style={{ fontWeight: 700, fontSize: '1rem', color: c.text, marginBottom: '0.4rem' }}>
        🕒 {statusLine}
      </p>

      <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#334155' }}>
        Prochain paiement de{' '}
        <strong>
          {field(
            Number.isFinite(unitData?.rentAmount)
              ? formatFCFA(unitData.rentAmount)
              : '',
            'rentAmount'
          )}
        </strong>{' '}
        dû le {field(prettyDueDate, 'rentDueDate')}
      </p>

      {unitData?.propertyAddress && (
        <p style={{ marginTop: 4, color: '#64748b', fontSize: '0.9rem' }}>
          📍 {unitData.propertyAddress}
        </p>
      )}

      {/* ✅ Wrapper for button */}
      <div className="banner-btn-wrapper">
        <PayRentButton
          unitCode={safeUnitCode || undefined}
          period={{
            year: nextDueDate.getFullYear(),
            month: nextDueDate.getMonth() + 1,
          }}
          amountXof={unitData?.rentAmount}
          label="Payer le loyer"
          renterName={unitData?.name}
          renterEmail={unitData?.email}
          onAccepted={onAccepted}
          onRefused={onRefused}
          onClosed={onClosed}
        />
      </div>

      {!safeUnitCode && (
        <div style={{ marginTop: 8, color: '#dc2626', fontWeight: 600 }}>
          Le code du logement est manquant — impossible d’initier le paiement.
        </div>
      )}
    </div>
  );
}

export default RentBanner;

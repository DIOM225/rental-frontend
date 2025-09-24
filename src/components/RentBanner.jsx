import { FaMobileAlt } from 'react-icons/fa';
import PayRentButton from './PayRentButton';
import { formatFCFA } from '../utils/formatting';

function RentBanner({
  unitData,
  field,
  safeUnitCode,
  onAccepted,
  onRefused,
  onClosed
}) {
  // ✅ Use real due date from backend (fallback to 10 if missing)
  const dueDay = unitData?.rentDueDate || 10;

  // Compute next due date (current or next month)
  const today = new Date();
  let nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);

  if (today > nextDueDate) {
    // If today is past the due day → push to next month
    nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  const prettyDueDate = nextDueDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ✅ Days remaining
  const dr = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

  // Banner color variant
  const bannerVariant =
    dr > 3 ? 'success' : dr >= 0 ? 'warning' : 'danger';

  const statusColor =
    bannerVariant === 'success'
      ? '#065f46'
      : bannerVariant === 'warning'
      ? '#92400e'
      : '#991b1b';

  const statusLine =
    dr > 1
      ? `Paiement dans ${dr} jours`
      : dr === 1
      ? 'Paiement dans 1 jour'
      : dr === 0
      ? 'Paiement aujourd’hui'
      : `En retard de ${Math.abs(dr)} jours`;

  const bannerStyle = {
    padding: '1rem',
    borderRadius: '14px',
    margin: '1rem 0 1.5rem',
    backgroundColor:
      bannerVariant === 'success'
        ? '#ecfdf5'
        : bannerVariant === 'warning'
        ? '#fffbeb'
        : '#fef2f2',
    border: '1px solid #e2e8f0',
  };

  return (
    <div className="loye-banner" style={bannerStyle}>
      <div
        className="loye-banner-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              color: statusColor,
              margin: 0,
            }}
          >
            🕒 {statusLine}
          </p>

          <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: '#334155' }}>
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
            <p style={{ marginTop: 4, color: '#334155' }}>
              📍 {unitData.propertyAddress}
            </p>
          )}
        </div>

        <div
          className="loye-banner-buttons"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <span
            style={{
              backgroundColor: '#e0edff',
              padding: '0.35rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #c7dbff',
              color: '#2563eb',
              fontWeight: 700,
            }}
          >
            <FaMobileAlt /> Wallet prêt
          </span>

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

import { FaMobileAlt } from 'react-icons/fa';
import PayRentButton from './PayRentButton';
import { formatFCFA, fmtDate, dueDate10 } from '../utils/formatting';

function RentBanner({
  unitData,
  field,
  safeUnitCode,
  onAccepted,
  onRefused,
  onClosed
}) {
  const dr = Number.isFinite(unitData?.daysRemaining) ? unitData.daysRemaining : null;

  const bannerVariant = dr == null
    ? 'neutral'
    : (dr > 3 ? 'success' : (dr >= 0 ? 'warning' : 'danger'));

  const statusColor = bannerVariant === 'success'
    ? '#065f46'
    : bannerVariant === 'warning'
    ? '#92400e'
    : bannerVariant === 'danger'
    ? '#991b1b'
    : '#334155';

  const statusLine = dr == null
    ? 'Statut du loyer'
    : dr > 1
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
      bannerVariant === 'success' ? '#ecfdf5'
      : bannerVariant === 'warning' ? '#fffbeb'
      : bannerVariant === 'danger' ? '#fef2f2'
      : '#f8fafc',
    border: '1px solid #e2e8f0'
  };

  // Always show the 10th as the due date (current or next month)
  const prettyDueDate = fmtDate(dueDate10(unitData?.dueDate || new Date()));

  return (
    <div className="loye-banner" style={bannerStyle}>
      <div className="loye-banner-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '1rem', color: statusColor, margin: 0 }}>
            🕒 {statusLine}
          </p>

          <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: '#334155' }}>
            Prochain paiement de{' '}
            <strong>
              {field(
                Number.isFinite(unitData?.rentAmount) ? formatFCFA(unitData.rentAmount) : '',
                'rentAmount'
              )}
            </strong>{' '}
            dû le {field(prettyDueDate, 'dueDate')}
          </p>

          {unitData?.propertyAddress && (
            <p style={{ marginTop: 4, color: '#334155' }}>
              📍 {unitData.propertyAddress}
            </p>
          )}
        </div>

        <div className="loye-banner-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{
            backgroundColor: '#e0edff',
            padding: '0.35rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid #c7dbff',
            color: '#2563eb',
            fontWeight: 700
          }}>
            <FaMobileAlt /> Wallet prêt
          </span>

          {/* The Pay button; phone/email/name routed via parent (unitData) */}
          <PayRentButton
            unitCode={safeUnitCode || undefined}
            // You can pass a computed period if needed; the backend validates
            period={{ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }}
            amountXof={unitData?.rentAmount}
            label="Payer le loyer"
            channels="MOBILE_MONEY,WALLET"
            renterCountry="CI"
            renterPhone10={undefined /* optional hint; you may pass normalized phone if you have it */}
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

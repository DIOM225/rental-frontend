import DetailRow from './DetailRow';
import { fmtDate, dueDate10 } from '../utils/formatting';

function PropertyDetails({ unitData, formatFCFA, safeUnitCode, red, isBlank }) {
  const field = (val, labelForFallback) =>
    (isBlank(val) && !Number.isFinite(val))
      ? <span style={red}>(à relier à la DB: {labelForFallback})</span>
      : <>{val}</>;

  // Always show the 10th as the due date (current or next month)
  const prettyDueDate = fmtDate(dueDate10(unitData?.dueDate || new Date()));

  return (
    <div className="loye-card" style={styles.card}>
      <h3 style={styles.cardTitle}>🏠 Détails du logement</h3>
      <div style={styles.detailList}>
        <DetailRow label="Immeuble" value={field(unitData?.propertyName, 'propertyName')} />
        <DetailRow label="Adresse" value={field(unitData?.propertyAddress, 'propertyAddress')} />
        <DetailRow label="Type" value={field(unitData?.unitType, 'unitType')} />
        <DetailRow
          label="Code logement"
          value={safeUnitCode || <span style={red}>(à relier à la DB: unitCode)</span>}
        />
        <DetailRow
          label="Loyer mensuel"
          value={field(
            Number.isFinite(unitData?.rentAmount) ? formatFCFA(unitData.rentAmount) : '',
            'rentAmount'
          )}
        />
        <DetailRow
          label="Prochaine échéance"
          value={field(prettyDueDate, 'dueDate')}
        />
        <DetailRow label="Fin du bail" value={field(unitData?.leaseEnd, 'leaseEnd')} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    padding: '1.2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f7'
  },
  cardTitle: { fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.8rem' },
  detailList: { display: 'grid', gap: 10 }
};

export default PropertyDetails;

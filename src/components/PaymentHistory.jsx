// 📄 src/components/PaymentHistory.jsx
import EmptyState from './EmptyState';

function PaymentHistory({ history, historyLoading, formatFCFA }) {
  return (
    <div className="loye-card" style={styles.card}>
      <h3 style={styles.cardTitle}>🧾 Historique des paiements</h3>

      {historyLoading ? (
        <div style={{ ...styles.skel, height: 60 }} />
      ) : history.length === 0 ? (
        <EmptyState
          title="Aucun paiement pour le moment"
          helper="Votre historique apparaîtra ici après votre premier paiement."
        />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {history.map((p) => (
            <div
              key={p._id || p.transactionId}
              style={styles.item}
            >
              <div style={styles.colLeft}>
                {p.period?.month}/{p.period?.year} — {p.unitCode}
                <div style={styles.sub}>{p.transactionId}</div>
              </div>
              <div style={styles.col}>{formatFCFA(p.netAmount > 0 ? p.netAmount : p.amount)}</div>
              <div style={{ ...styles.col, color: statusColor(p.status) }}>
                {p.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusColor(status) {
  if (status === 'ACCEPTED') return '#065f46';
  if (status === 'REFUSED') return '#991b1b';
  return '#92400e';
}

const styles = {
  card: {
    backgroundColor: 'white',
    padding: '1.2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f7'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '0.8rem'
  },
  skel: {
    background: 'linear-gradient(90deg, #e9eef5 25%, #f3f6fb 37%, #e9eef5 63%)',
    backgroundSize: '400% 100%',
    borderRadius: 8,
    animation: 'skel 1.4s ease infinite'
  },
  item: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 8,
    padding: '10px 12px',
    background: '#f8fafc',
    border: '1px solid #eef2f7',
    borderRadius: 10
  },
  colLeft: { fontWeight: 700 },
  sub: { fontSize: 12, color: '#64748b' },
  col: { fontWeight: 800 }
};

export default PaymentHistory;

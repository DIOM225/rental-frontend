// 📄 src/components/DetailRow.jsx
function DetailRow({ label, value }) {
    return (
      <div className="loye-detail-row" style={styles.detailRow}>
        <span style={styles.detailLabel}>{label}</span>
        <span style={styles.detailValue}>{value}</span>
      </div>
    );
  }
  
  const styles = {
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 10px',
      borderRadius: 8,
      background: '#f8fafc',
      border: '1px solid #eef2f7'
    },
    detailLabel: { color: '#64748b', fontWeight: 700 },
    detailValue: { color: '#0f172a', fontWeight: 700 }
  };
  
  export default DetailRow;
  
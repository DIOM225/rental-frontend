// 📄 src/components/MetricCard.jsx
function MetricCard({ label, value, icon, dot }) {
    return (
      <div style={styles.metricCard}>
        <div style={styles.metricLeft}>
          <p style={styles.metricLabel}>{label}</p>
          <h3 className="loye-metric-value" style={styles.metricValue}>{value}</h3>
        </div>
        <div style={styles.iconWrap}>
          {icon}
          <span style={{ ...styles.dot, background: dot }} />
        </div>
      </div>
    );
  }
  
  const styles = {
    metricCard: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #eef2f7'
    },
    metricLeft: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
    metricLabel: {
      fontSize: '0.9rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.7
    },
    metricValue: {
      fontSize: '1.4rem',
      fontWeight: 800,
      color: '#0f172a',
      margin: 0
    },
    iconWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 12,
      background: '#f8fafc',
      border: '1px solid #eef2f7',
      position: 'relative'
    },
    dot: {
      position: 'absolute',
      right: -4,
      top: -4,
      width: 10,
      height: 10,
      borderRadius: '50%'
    }
  };
  
  export default MetricCard;
  
// 📄 src/components/EmptyState.jsx
function EmptyState({ title, helper }) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyIcon}>💳</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#64748b' }}>{helper}</div>
      </div>
    );
  }
  
  const styles = {
    emptyWrap: {
      border: '1px dashed #cbd5e1',
      borderRadius: 12,
      padding: 24,
      textAlign: 'center',
      color: '#0f172a',
      background: '#f8fafc'
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: '#eef2ff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      fontSize: 22
    }
  };
  
  export default EmptyState;
  
// 📄 src/components/ContactDetails.jsx
function ContactDetails({ unitData, field }) {
    return (
      <div className="loye-card" style={styles.card}>
        <h3 style={styles.cardTitle}>📞 Informations de contact</h3>
        <div style={styles.infoRow}>
          <div style={{ flex: 1 }}>
            <h4 style={styles.infoHeader}>Vos infos</h4>
            <p style={styles.infoText}>
              📧 Email: {field(unitData.email, 'email')}
              <br />
              📞 Téléphone: {field(unitData.phone, 'phone')}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.infoHeader}>Gestionnaire</h4>
            <p style={styles.infoText}>
              📧 Email: {field(unitData.mgmtEmail, 'mgmtEmail')}
              <br />
              📞 Téléphone: {field(unitData.mgmtPhone, 'mgmtPhone')}
              <br />
              ⏰ Heures: {field(unitData.hours, 'hours')}
            </p>
          </div>
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
    infoRow: { display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' },
    infoHeader: { fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' },
    infoText: { margin: 0, lineHeight: 1.8, color: '#334155' }
  };
  
  export default ContactDetails;
  
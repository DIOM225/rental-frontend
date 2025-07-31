import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaHome, FaMoneyBillWave, FaMapMarkerAlt, FaMobileAlt, FaCreditCard } from 'react-icons/fa';

function RenterDashboard() {
  const [unitData, setUnitData] = useState(null); // start as null

  useEffect(() => {
    // Mock static data — replace with actual API call in real use
    setUnitData({
      name: 'madou',
      unit: 'Unit 101',
      rentAmount: 2000,
      dueDate: 'Aug 1, 2025',
      daysRemaining: 1,
      leaseEnd: 'Dec 30, 2024',
      unitType: '2BR / 2BA',
      email: 'diomande.madou22@gmail.com',
      phone: '3475752876',
      mgmtEmail: 'management@loye.com',
      mgmtPhone: '+1-555-LOYE (5693)',
      hours: 'Mon-Fri: 9AM–6PM'
    });
  }, []);

  if (!unitData) return null; // Prevent rendering before data is ready

  const isRentDue = unitData.daysRemaining <= 3;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Welcome back, {unitData.name}</h2>
        <p style={styles.unit}><FaMapMarkerAlt style={styles.iconInline} /> - {unitData.unit}</p>
      </div>

      {/* Rent Due Banner */}
      {isRentDue && (
        <div style={styles.banner}>
          <div>
            <p style={styles.bannerTitle}>🕒 Rent Status</p>
            <p style={styles.bannerText}>Rent due in {unitData.daysRemaining} days</p>
            <p style={styles.bannerText}>Next payment of <strong>${unitData.rentAmount.toFixed(2)}</strong> due {unitData.dueDate}</p>
          </div>
          <div style={styles.bannerButtons}>
            <span style={styles.waveReady}><FaMobileAlt /> <span style={styles.waveText}>Wave Money Ready</span></span>
            <button style={styles.payBtn}><FaCreditCard style={{ marginRight: 6 }} /> Pay Rent</button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Monthly Rent</p>
            <h3 style={styles.metricValue}>${unitData.rentAmount.toFixed(2)}</h3>
          </div>
          <FaMoneyBillWave size={24} color="#10B981" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Next Due</p>
            <h3 style={styles.metricValue}>{unitData.dueDate?.split(',')[0]}</h3>
          </div>
          <FaCalendarAlt size={22} color="#3B82F6" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Lease End</p>
            <h3 style={styles.metricValue}>{unitData.leaseEnd}</h3>
          </div>
          <FaClock size={22} color="#8B5CF6" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Unit Type</p>
            <h3 style={styles.metricValue}>{unitData.unitType}</h3>
          </div>
          <FaHome size={22} color="#F97316" />
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button style={styles.tabBtn}>Payment History</button>
        <button style={styles.tabBtn}>Unit Details</button>
        <button style={{ ...styles.tabBtn, ...styles.activeTab }}>Contact Info</button>
      </div>

      {/* Contact Info */}
      <div style={styles.contactCard}>
        <h3 style={styles.contactTitle}>📞 Contact Information</h3>
        <p style={styles.infoNote}>ℹ️ For maintenance requests, emergencies, or questions about your lease, please contact the property management team.</p>
        <div style={styles.infoRow}>
          <div>
            <h4 style={styles.infoHeader}>Your Information</h4>
            <p>📧 Email: {unitData.email}<br />📞 Phone: {unitData.phone}</p>
          </div>
          <div>
            <h4 style={styles.infoHeader}>Property Management</h4>
            <p>📧 Email: {unitData.mgmtEmail}<br />📞 Phone: {unitData.mgmtPhone}<br />⏰ Office Hours: {unitData.hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f8fafc', padding: '2rem', minHeight: '100vh' },
  headerRow: { display: 'flex', flexDirection: 'column', marginBottom: '1rem' },
  heading: { fontSize: '2rem', fontWeight: 700, marginBottom: '0.2rem' },
  unit: { display: 'flex', alignItems: 'center', color: '#475569' },
  iconInline: { marginRight: 4 },

  banner: { backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  bannerTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: 4 },
  bannerText: { margin: 0, fontSize: '0.95rem', color: '#334155' },
  bannerButtons: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  waveReady: { backgroundColor: '#e0edff', padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 },
  waveText: { color: '#2563eb', fontWeight: 600 },
  payBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metricCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 3px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricLeft: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  metricLabel: { fontSize: '0.9rem', fontWeight: 600, color: '#64748b' },
  metricValue: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' },

  tabsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' },
  tabBtn: { flex: 1, padding: '0.8rem', border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer', color: '#475569' },
  activeTab: { backgroundColor: 'white', color: '#0f172a' },

  contactCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  contactTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' },
  infoNote: { fontSize: '0.95rem', marginBottom: '1rem', color: '#555' },
  infoRow: { display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' },
  infoHeader: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' },
};

export default RenterDashboard;

import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import {
  FaCalendarAlt, FaClock, FaHome, FaMoneyBillWave,
  FaMapMarkerAlt, FaMobileAlt, FaCreditCard
} from 'react-icons/fa';

function LoyeDashboard() {
  const [unitData, setUnitData] = useState(null);

  const mockData = {
    name: 'Madou',
    unit: 'Unit 101',
    rentAmount: 2000,
    dueDate: '1 Août 2025',
    daysRemaining: 2,
    leaseEnd: '30 Décembre 2024',
    unitType: '2 Pièces',
    email: 'diomande.madou22@gmail.com',
    phone: '0700000000',
    mgmtEmail: 'gestion@loye.com',
    mgmtPhone: '+2250707070707',
    hours: 'Lun–Ven: 9h–18h'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/loye/renter/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.name) {
          setUnitData(res.data);
        } else {
          console.warn("API data incomplete, loading mock data.");
          setUnitData(mockData);
        }
      } catch (err) {
        console.warn("Échec API, fallback vers données fictives:", err.message);
        setUnitData(mockData);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!unitData) return null;

  const isRentDue = unitData.daysRemaining <= 3;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Bienvenue, {unitData.name}</h2>
        <p style={styles.unit}><FaMapMarkerAlt style={styles.iconInline} /> - {unitData.unit}</p>
      </div>

      {isRentDue && (
        <div style={styles.banner}>
          <div>
            <p style={styles.bannerTitle}>🕒 Statut du loyer</p>
            <p style={styles.bannerText}>Paiement dans {unitData.daysRemaining} jours</p>
            <p style={styles.bannerText}>Montant: <strong>{unitData.rentAmount} FCFA</strong> dû le {unitData.dueDate}</p>
          </div>
          <div style={styles.bannerButtons}>
            <span style={styles.waveReady}><FaMobileAlt /> <span style={styles.waveText}>Wave prêt</span></span>
            <button style={styles.payBtn}><FaCreditCard style={{ marginRight: 6 }} /> Payer</button>
          </div>
        </div>
      )}

      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Loyer mensuel</p>
            <h3 style={styles.metricValue}>{unitData.rentAmount} FCFA</h3>
          </div>
          <FaMoneyBillWave size={24} color="#10B981" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Prochaine échéance</p>
            <h3 style={styles.metricValue}>{unitData.dueDate?.split(',')[0]}</h3>
          </div>
          <FaCalendarAlt size={22} color="#3B82F6" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Fin du bail</p>
            <h3 style={styles.metricValue}>{unitData.leaseEnd}</h3>
          </div>
          <FaClock size={22} color="#8B5CF6" />
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Type</p>
            <h3 style={styles.metricValue}>{unitData.unitType}</h3>
          </div>
          <FaHome size={22} color="#F97316" />
        </div>
      </div>

      <div style={styles.tabsRow}>
        <button style={styles.tabBtn}>Historique</button>
        <button style={styles.tabBtn}>Détails</button>
        <button style={{ ...styles.tabBtn, ...styles.activeTab }}>Contact</button>
      </div>

      <div style={styles.contactCard}>
        <h3 style={styles.contactTitle}>📞 Informations de contact</h3>
        <p style={styles.infoNote}>ℹ️ Pour les urgences ou demandes, contactez la gestion.</p>
        <div style={styles.infoRow}>
          <div>
            <h4 style={styles.infoHeader}>Vos infos</h4>
            <p>📧 Email: {unitData.email}<br />📞 Téléphone: {unitData.phone}</p>
          </div>
          <div>
            <h4 style={styles.infoHeader}>Gestionnaire</h4>
            <p>📧 Email: {unitData.mgmtEmail}<br />📞 Téléphone: {unitData.mgmtPhone}<br />⏰ Heures: {unitData.hours}</p>
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

  banner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  bannerTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: 4 },
  bannerText: { margin: 0, fontSize: '0.95rem', color: '#334155' },
  bannerButtons: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  waveReady: {
    backgroundColor: '#e0edff',
    padding: '0.3rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  waveText: { color: '#2563eb', fontWeight: 600 },
  payBtn: {
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center'
  },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLeft: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  metricLabel: { fontSize: '0.9rem', fontWeight: 600, color: '#64748b' },
  metricValue: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' },

  tabsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  tabBtn: {
    flex: 1,
    padding: '0.8rem',
    border: 'none',
    background: 'transparent',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#475569'
  },
  activeTab: { backgroundColor: 'white', color: '#0f172a' },

  contactCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  contactTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' },
  infoNote: { fontSize: '0.95rem', marginBottom: '1rem', color: '#555' },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  infoHeader: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' },
};

export default LoyeDashboard;

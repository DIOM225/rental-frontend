import { useEffect, useState, useCallback } from 'react'; 
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaMoneyBillWave,
  FaHome,
  FaChartLine,
  FaEye,
} from 'react-icons/fa';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Force "." as thousands separator (e.g., 2500000 -> "2.500.000")
  const formatNumberCI = (value) => {
    const n = Number(value) || 0;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
 
  const fetchProperties = useCallback(async () => {
    try {
      const res = await axios.get('/api/loye/properties', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(
        '/api/loye/onboarding',
        { code: inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // ✅ Store new token and updated user info with correct role
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
  
      setSuccess('Code accepté ! Redirection...');
      setTimeout(() => {
        if (res.data.user.role === 'renter') {
          navigate('/loye/dashboard');
        } else {
          navigate('/loye/properties');
        }
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Code invalide.';
      setError(msg);
    }
  };
  
  // 🔢 Aggregate totals for the top revenue card (confirmed / expected)
  const { totalConfirmed, totalExpected } = properties.reduce(
    (acc, p) => {
      acc.totalConfirmed += p.revenue?.confirmed || 0;
      acc.totalExpected += p.revenue?.expected || 0;
      return acc;
    },
    { totalConfirmed: 0, totalExpected: 0 }
  );
  

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Mes Propriétés</h2>
          <p style={styles.subtitle}>Gérez vos biens locatifs et suivez leurs performances</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.primaryButton}>
            + Ajouter une propriété
          </button>
          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/loye/create');
                }}
              >
                Créer une propriété
              </button>
              <button style={styles.dropdownItem} onClick={() => setShowCodeInput(!showCodeInput)}>
                Entrer un code d'invitation
              </button>
              {showCodeInput && (
                <form onSubmit={handleInviteSubmit} style={styles.codeBox}>
                  <input
                    type="text"
                    placeholder="Code d'invitation"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    style={styles.codeInput}
                    required
                  />
                  <button type="submit" style={styles.codeButton}>Valider</button>
                  {error && <p style={styles.error}>{error}</p>}
                  {success && <p style={styles.success}>{success}</p>}
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <div>
              <p style={styles.metricLabel}>Propriétés totales</p>
              <h3 style={styles.metricValue}>{properties.length}</h3>
            </div>
            <FaBuilding size={36} color="#3B82F6" />
          </div>
        </div>

        {/* ✅ Updated revenue card layout */}
        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <div>
              <p style={styles.metricLabel}>Revenu mensuel</p>
              <h3 style={styles.metricValue}>
                {formatNumberCI(totalConfirmed)} FCFA
              </h3>
              <p style={styles.metricSub}>
                / {formatNumberCI(totalExpected)} FCFA
              </p>
            </div>
            <FaMoneyBillWave size={36} color="#10B981" />
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <div>
              <p style={styles.metricLabel}>Nombre d'unités</p>
              <h3 style={styles.metricValue}>
                {properties.reduce((sum, p) => sum + (p.units?.length || 0), 0)}
              </h3>
            </div>
            <FaHome size={36} color="#8B5CF6" />
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <div>
              <p style={styles.metricLabel}>Taux d’occupation</p>
              <h3 style={styles.metricValue}>0%</h3>
            </div>
            <FaChartLine size={36} color="#F97316" />
          </div>
        </div>
      </div>

      <div style={styles.propertiesGrid}>
        {properties.length === 0 ? (
          <div style={styles.emptyCard}>
            <h3 style={styles.emptyTitle}>Aucune propriété trouvée</h3>
            <p>Commencez à constituer votre portefeuille en ajoutant une propriété.</p>
            <button onClick={() => navigate('/loye/create')} style={styles.primaryButton}>
              + Ajouter une propriété
            </button>
          </div>
        ) : (
          properties.map((property) => {
            const confirmedTotal = property.revenue?.confirmed || 0;
            const expectedTotal = property.revenue?.expected || 0;
            
            return (
              <div key={property._id} style={styles.propertyCard}>
                <div style={styles.propertyTop}>
                  <h4 style={{ margin: 0 }}>{property.name}</h4>
                  <span style={styles.statusBadge}>actif</span>
                </div>
                <p style={styles.address}>{property.address}</p>
                <div style={styles.row}>
                  <div>Unités <strong>{property.units?.length || 0}</strong></div>
                  <div>Occupation <strong>0%</strong></div>
                </div>
                <div style={styles.row}>
                  <div>
                    Revenu mensuel{' '}
                    <strong>
                      {formatNumberCI(confirmedTotal)} / {formatNumberCI(expectedTotal)} FCFA
                    </strong>
                  </div>
                  <div>Créé par <strong>{property.createdByRole}</strong></div>
                </div>
                <button
                  style={styles.viewBtn}
                  onClick={() => navigate(`/loye/property/${property._id}`)}
                >
                  <FaEye />
                  &nbsp; Voir détails
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', fontWeight: 700, margin: 0 },
  subtitle: { fontSize: '1rem', color: '#555', marginTop: '0.5rem' },
  primaryButton: { padding: '0.6rem 1.2rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  dropdownMenu: { position: 'absolute', right: 0, top: '110%', background: 'white', border: '1px solid #ccc', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', padding: '0.5rem', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '220px' },
  dropdownItem: { padding: '0.5rem 1rem', background: '#f9f9f9', borderRadius: '4px', cursor: 'pointer', border: 'none', textAlign: 'left' },
  codeBox: { marginTop: '0.5rem', padding: '0.8rem', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  codeInput: { padding: '0.5rem', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' },
  codeButton: { padding: '0.5rem', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '0.9rem' },
  success: { color: 'green', fontSize: '0.9rem' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  metricCard: { padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 3px 6px rgba(0,0,0,0.05)', flex: '1' },
  metricTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: '0.95rem', fontWeight: 600, color: '#444', marginBottom: '0.4rem' },
  metricValue: { fontSize: '1.8rem', fontWeight: 700 },
  metricSub: { fontSize: '0.9rem', color: '#6b7280', margin: 0 }, // 👈 small, muted expected total
  propertiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' },
  propertyCard: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 3px 8px rgba(0,0,0,0.07)', transition: 'all 0.2s ease', cursor: 'pointer' },
  propertyTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  statusBadge: { backgroundColor: '#d1fae5', color: '#047857', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '999px', fontWeight: 600 },
  address: { fontSize: '0.95rem', color: '#555', marginBottom: '0.6rem' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' },
  viewBtn: { marginTop: '1rem', width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  emptyCard: { background: '#f1f5f9', padding: '2rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  emptyTitle: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' },
  unitRow: { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 1rem', background: '#f9f9f9', marginBottom: '0.5rem', borderRadius: '6px' },
  unitInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.95rem' },
  codeText: { marginLeft: '0.5rem', color: '#334155', fontWeight: 600, fontSize: '0.85rem' },
  unitBadge: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '999px' },
};

export default OwnerProperties;

// client/src/pages/loye/OwnerProperties.jsx
import { useEffect, useState, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const actionRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchProperties = async () => {
    try {
      const res = await axios.get('/api/loye/properties');
      setProperties(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // 🔸 Close floating menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setShowActions(false);
        setShowCodeInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(
        '/api/loye/onboarding',
        { code: inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, loye: { role: res.data.role } };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Code accepté! Redirection...');
      setTimeout(() => {
        if (res.data.role === 'renter') {
          navigate('/loye/dashboard');
        } else {
          navigate('/loye/properties');
        }
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Code invalide.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Mes Propriétés</h2>
      {properties.length === 0 ? (
        <p>Aucune propriété trouvée.</p>
      ) : (
        properties.map((property) => (
          <div key={property._id} style={styles.card}>
            <h4>{property.name}</h4>
            <p>{property.address}</p>
          </div>
        ))
      )}

      {/* Floating Action Button */}
      <div style={styles.fabContainer} ref={actionRef}>
        <button onClick={() => setShowActions(!showActions)} style={styles.fab}>
          +
        </button>

        {showActions && (
          <div style={styles.actions}>
            <button
              style={styles.actionBtn}
              onClick={() => {
                setShowActions(false);
                navigate('/loye/create');
              }}
            >
              Créer Propriété
            </button>
            <button
              style={styles.actionBtn}
              onClick={() => {
                setShowCodeInput(!showCodeInput);
              }}
            >
              Entrer Code
            </button>
          </div>
        )}

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
            <button type="submit" style={styles.codeButton} disabled={loading}>
              {loading ? '...' : 'Valider'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    position: 'relative',
  },
  card: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  fabContainer: {
    position: 'fixed',
    top: '8rem',
    right: '1.5rem',
    zIndex: 1000,
  },
  fab: {
    fontSize: '2rem',
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    border: 'none',
    backgroundColor: '#ff6f00',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  actions: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.95rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  codeBox: {
    marginTop: '0.5rem',
    padding: '0.8rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  codeInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  codeButton: {
    padding: '0.5rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
  },
  success: {
    color: 'green',
    fontSize: '0.9rem',
  },
};

export default OwnerProperties;

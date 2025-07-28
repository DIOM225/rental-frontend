// 📄 client/src/pages/loye/LoyeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeDashboard() {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitInfo, setUnitInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('loyeUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      if (parsed.role === 'renter') {
        fetchUnitInfo(parsed);
      } else if (parsed.role === 'owner' || parsed.role === 'manager') {
        navigate('/loye/properties');
      }
    }
  }, []);

  const fetchUnitInfo = async (parsedUser) => {
    try {
      const res = await axios.get('/api/loye/renter/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnitInfo(res.data);
    } catch (err) {
      console.error('Failed to load unit info:', err);
      setError("Impossible de récupérer les informations du logement.");
    }
  };

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    if (role === 'owner' || role === 'manager') {
      try {
        const res = await axios.post('/api/loye/onboarding/assign-role', { role }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem('loyeUser', JSON.stringify(res.data));
        navigate('/loye/properties');
      } catch (err) {
        console.error('Erreur:', err);
        setMessage(err.response?.data?.message || 'Échec de l\'attribution du rôle.');
      }
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/loye/link-unit', { code: unitCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem('loyeUser', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setUnitInfo(res.data.unitInfo);
      setMessage('');
    } catch (err) {
      console.error('Erreur:', err);
      setMessage(err.response?.data?.message || 'Échec de la liaison au logement.');
    }
  };

  if (error) {
    return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  }

  if (user?.role === 'renter' && unitInfo) {
    const { unit, property, owner, manager } = unitInfo;

    return (
      <div style={styles.container}>
        <h2>Tableau de bord locataire</h2>

        <div style={styles.card}>
          <h3>🏠 Propriété : {property.name}</h3>
          <p><strong>Adresse :</strong> {property.address}</p>
          <p><strong>Type de logement :</strong> {unit.type}</p>
          <p><strong>Loyer mensuel :</strong> {unit.rent} FCFA</p>
        </div>

        <div style={styles.card}>
          <h3>💼 Propriétaire</h3>
          <p><strong>Nom :</strong> {owner?.name || '—'}</p>
          <p><strong>Téléphone :</strong> {owner?.phone || '—'}</p>
        </div>

        <div style={styles.card}>
          <h3>👤 Gestionnaire</h3>
          <p><strong>Nom :</strong> {manager?.name || '—'}</p>
          <p><strong>Téléphone :</strong> {manager?.phone || '—'}</p>
        </div>

        <div style={styles.card}>
          <h3>💳 Paiement</h3>
          <p><strong>Statut du loyer :</strong> En attente</p>
          <button style={styles.payBtn}>Payer avec Wave</button>
        </div>

        <div style={styles.card}>
          <h3>📜 Historique des paiements</h3>
          <ul>
            <li>Juin 2025 - 100 000 FCFA - ✅</li>
            <li>Juillet 2025 - En attente ❌</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenue 👋</h2>

      {!user?.role && (
        <div style={boxStyle}>
          <h3>Êtes-vous ici pour :</h3>
          <button onClick={() => handleRoleSelect('renter')} style={btn}>💳 Payer un loyer</button>
          <button onClick={() => handleRoleSelect('owner')} style={btn}>🏠 Gérer mes propriétés</button>
          <button onClick={() => handleRoleSelect('manager')} style={btn}>🛠️ Gérer pour un propriétaire</button>
        </div>
      )}

      {selectedRole === 'renter' && !user?.role && (
        <div style={boxStyle}>
          <h3>Entrez votre code d'appartement :</h3>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              placeholder="Ex: 2B-XK49P1"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              required
              style={{ padding: '0.6rem', width: '250px', marginRight: '1rem' }}
            />
            <button type="submit" style={btn}>Soumettre</button>
          </form>
          {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
  },
  card: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.2rem',
    marginBottom: '1.5rem',
  },
  payBtn: {
    padding: '0.6rem 1.4rem',
    fontSize: '1rem',
    backgroundColor: '#008CBA',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

const boxStyle = {
  marginTop: '1.5rem',
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '10px',
  backgroundColor: '#f9f9f9',
};

const btn = {
  padding: '0.6rem 1.2rem',
  marginRight: '1rem',
  marginTop: '1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default LoyeDashboard;

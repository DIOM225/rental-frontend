// 📄 src/pages/loye/LoyeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeDashboard() {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('loyeUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Simulate first-time role choice
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'owner') navigate('/loye/properties');
    if (role === 'manager') navigate('/loye/properties'); // Later we can redirect them elsewhere
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('loyeToken');
      await axios.post('/api/loye/link-unit', { code: unitCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Unit linked successfully!');
      // Refresh or re-fetch user info
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to link unit.');
    }
  };

  if (!user) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenue, {user.name} 👋</h2>

      {!user.role && (
        <div style={boxStyle}>
          <h3>Êtes-vous ici pour :</h3>
          <button onClick={() => handleRoleSelect('renter')} style={btn}>💳 Payer un loyer</button>
          <button onClick={() => handleRoleSelect('owner')} style={btn}>🏠 Gérer mes propriétés</button>
          <button onClick={() => handleRoleSelect('manager')} style={btn}>🛠️ Gérer pour un propriétaire</button>
        </div>
      )}

      {selectedRole === 'renter' && (
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
          {message && <p>{message}</p>}
        </div>
      )}

      {/* If user.role = renter and already linked to unit, show unit info (TO DO LATER) */}
    </div>
  );
}

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

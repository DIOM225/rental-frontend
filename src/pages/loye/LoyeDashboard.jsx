import React, { useEffect, useState } from 'react';

function LoyeDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loyeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenue, {user.name} 👋</h2>
      <p>Rôle: <strong>{user.role}</strong></p>

      {user.role === 'renter' && (
        <div style={boxStyle}>
          <h3>📦 Espace Locataire</h3>
          <p>Vous pouvez voir vos paiements, votre logement, ou contacter votre gestionnaire.</p>
        </div>
      )}

      {user.role === 'manager' && (
        <div style={boxStyle}>
          <h3>🛠️ Tableau de Gestion</h3>
          <p>Gérez les propriétés, répondez aux locataires, et suivez les paiements.</p>
        </div>
      )}

      {user.role === 'owner' && (
        <div style={boxStyle}>
          <h3>🏠 Espace Propriétaire</h3>
          <p>Consultez les revenus locatifs, ajoutez des propriétés, ou discutez avec votre gestionnaire.</p>
          <a href="/loye/properties" style={{ color: 'blue', marginTop: '0.5rem', display: 'inline-block' }}>
            ➕ Gérer mes propriétés
          </a>
        </div>
      )}
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

export default LoyeDashboard;

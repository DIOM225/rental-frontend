import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeDashboard() {
  const [unitInfo, setUnitInfo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchUnitInfo = useCallback(async () => {
    try {
      const res = await axios.get('/api/loye/renter/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnitInfo(res.data);
    } catch (err) {
      console.error('Failed to load unit info:', err);
      setError("Impossible de récupérer les informations du logement.");
    }
  }, [token]);

  useEffect(() => {
    if (!user || !user.loye || user.loye.role !== 'renter') {
      navigate('/loye/onboarding');
    } else {
      fetchUnitInfo();
    }
  }, [fetchUnitInfo, navigate, user]);

  if (error) {
    return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  }

  if (!unitInfo) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  const { unit, property, owner, manager } = unitInfo;

  return (
    <div style={styles.container}>
      <h2>Tableau de bord locataire</h2>

      <div style={styles.card}>
        <h3>🏠 Propriété : {property?.name || '—'}</h3>
        <p><strong>Adresse :</strong> {property?.address || '—'}</p>
        <p><strong>Type de logement :</strong> {unit?.type || '—'}</p>
        <p><strong>Loyer mensuel :</strong> {unit?.rent ? `${unit.rent} FCFA` : '—'}</p>
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

export default LoyeDashboard;

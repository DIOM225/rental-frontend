// client/src/pages/loye/CreateProperty.jsx
import { useState } from 'react';
import axios from '../../utils/axiosInstance';

function CreateProperty() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [units, setUnits] = useState({
    studio: { count: '', rent: '' },
    '1br': { count: '', rent: '' },
    '2br': { count: '', rent: '' },
    '3br': { count: '', rent: '' },
  });
  const [ownerInfo, setOwnerInfo] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleUnitChange = (type, field, value) => {
    setUnits((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const payload = {
        name,
        address,
        unitsByType: {},
      };

      // Filter and prepare units
      for (const type in units) {
        const { count, rent } = units[type];
        if (count && rent) {
          payload.unitsByType[type] = {
            count: parseInt(count),
            rent: parseInt(rent),
          };
        }
      }

      // If manager, send owner details
      if (user.loye.role === 'manager') {
        payload.ownerInfo = ownerInfo;
      }

      const res = await axios.post('/api/loye/properties', payload);
      setMessage(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Créer une Propriété</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Nom de la propriété"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Adresse"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={styles.input}
        />

        {Object.keys(units).map((type) => (
          <div key={type} style={styles.unitGroup}>
            <h4>{type.toUpperCase()}</h4>
            <input
              type="number"
              placeholder="Nombre d'unités"
              value={units[type].count}
              onChange={(e) => handleUnitChange(type, 'count', e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Loyer par unité (FCFA)"
              value={units[type].rent}
              onChange={(e) => handleUnitChange(type, 'rent', e.target.value)}
              style={styles.input}
            />
          </div>
        ))}

        {user.loye.role === 'manager' && (
          <div>
            <h4>Informations du propriétaire</h4>
            <input
              type="text"
              placeholder="Nom"
              value={ownerInfo.name}
              onChange={(e) => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={ownerInfo.email}
              onChange={(e) => setOwnerInfo({ ...ownerInfo, email: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Téléphone"
              value={ownerInfo.phone}
              onChange={(e) => setOwnerInfo({ ...ownerInfo, phone: e.target.value })}
              style={styles.input}
              required
            />
          </div>
        )}

        <button type="submit" style={styles.button}>Créer</button>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.8rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  unitGroup: {
    marginTop: '1rem',
  },
  button: {
    padding: '0.9rem',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    fontSize: '1rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
};

export default CreateProperty;

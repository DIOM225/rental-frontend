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
  const [message, setMessage] = useState('');
  const [inviteCodes, setInviteCodes] = useState(null);
  const [error, setError] = useState('');
  

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
    setInviteCodes(null);

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

      const res = await axios.post('/api/loye/properties', payload);
      setMessage(res.data.message);
      if (res.data.inviteCodes) {
        setInviteCodes(res.data.inviteCodes);
      }
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

        <button type="submit" style={styles.button}>Créer</button>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {inviteCodes && (
          <div style={styles.inviteBox}>
            {inviteCodes.ownerInviteCode && (
              <p><strong>Code d’invitation du propriétaire :</strong> {inviteCodes.ownerInviteCode}</p>
            )}
            {inviteCodes.managerInviteCode && (
              <p><strong>Code d’invitation du gestionnaire :</strong> {inviteCodes.managerInviteCode}</p>
            )}
          </div>
        )}
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
  inviteBox: {
    marginTop: '1rem',
    backgroundColor: '#e6f7ff',
    padding: '1rem',
    border: '1px solid #91d5ff',
    borderRadius: '6px',
    color: '#003a8c',
  },
};

export default CreateProperty;

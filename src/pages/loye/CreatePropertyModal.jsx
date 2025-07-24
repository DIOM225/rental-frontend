import { useState } from 'react';
import axios from '../../utils/axiosInstance';

function CreatePropertyModal({ onClose }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [unitsByType, setUnitsByType] = useState({
    studio: { count: 0, rent: 0 },
    '1br': { count: 0, rent: 0 },
    '2br': { count: 0, rent: 0 },
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/loye/properties', {
        name,
        address,
        unitsByType,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      setMessage('Erreur lors de la création.');
    }
  };

  const updateUnit = (type, field, value) => {
    setUnitsByType((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3>Créer une propriété</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du bâtiment" required />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" required />

          <h4>Unités</h4>
          {Object.entries(unitsByType).map(([type, info]) => (
            <div key={type} style={{ display: 'flex', gap: '0.5rem' }}>
              <label style={{ width: '60px' }}>{type.toUpperCase()}:</label>
              <input type="number" value={info.count} onChange={(e) => updateUnit(type, 'count', e.target.value)} placeholder="Nb" min="0" />
              <input type="number" value={info.rent} onChange={(e) => updateUnit(type, 'rent', e.target.value)} placeholder="Loyer" min="0" />
            </div>
          ))}

          <button type="submit">Créer</button>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#eee' }}>Annuler</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    minWidth: '400px',
    maxWidth: '90%',
  },
};

export default CreatePropertyModal;

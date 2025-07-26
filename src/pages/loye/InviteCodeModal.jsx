import { useState } from 'react';
import axios from '../../utils/axiosInstance';

function InviteCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/loye/invite',
        { code },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = { ...user, loye: { role: res.data.role } };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur. Réessayez.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Entrer votre code</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code d'invitation"
            required
            style={styles.input}
          />
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancel}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={styles.submit}>
              {loading ? 'Validation...' : 'Valider'}
            </button>
          </div>
          {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%',
    padding: '0.7rem',
    marginTop: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  actions: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
  },
  cancel: {
    backgroundColor: '#ccc',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submit: {
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default InviteCodeModal;

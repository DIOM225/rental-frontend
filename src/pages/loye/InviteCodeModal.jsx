// client/src/pages/loye/InviteCode.jsx
import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

function InviteCode() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/loye/invite', { code });

      setMessage(res.data.message);

      // Save role locally if needed
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.loye = { ...(user.loye || {}), role: res.data.role };
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect by role
      if (res.data.role === 'owner' || res.data.role === 'manager') {
        navigate('/loye/properties');
      } else if (res.data.role === 'renter') {
        navigate('/loye/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la soumission.';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Entrer un Code d'Invitation</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Code d'invitation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Soumettre</button>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '3rem auto',
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
  button: {
    padding: '0.8rem',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '1rem',
    border: 'none',
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

export default InviteCode;

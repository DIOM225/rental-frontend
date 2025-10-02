import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: '',
    birthday: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const saveAndRedirect = (res) => {
    const { token, user, loyeUnitCode } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const roleFromLoye = res.data?.user?.loye?.role;
    if (roleFromLoye) {
      localStorage.setItem('loyeRole', roleFromLoye);
    } else {
      localStorage.removeItem('loyeRole');
    }

    if (loyeUnitCode) {
      localStorage.setItem('loye.unitCode', loyeUnitCode);
    } else {
      localStorage.removeItem('loye.unitCode');
    }

    navigate('/');
    window.location.reload();
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        phone: form.phone,
        birthday: form.birthday,
        newPassword: form.newPassword,
      });

      // ✅ Directly log in after password reset
      saveAndRedirect(res);

    } catch (err) {
      const msg = err.response?.data?.message || '❌ Erreur lors de la réinitialisation du mot de passe.';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🔁 Réinitialiser le mot de passe</h2>
        <form onSubmit={handleReset} style={styles.form}>
          <input
            type="text"
            name="phone"
            placeholder="Votre téléphone"
            value={form.phone}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="date"
            name="birthday"
            placeholder="Votre date de naissance"
            value={form.birthday}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="Nouveau mot de passe"
            value={form.newPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Réinitialiser</button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '90vh',
  },
  card: {
    backgroundColor: '#fff', padding: '2rem', borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
    textAlign: 'center',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem',
  },
  input: {
    padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem', backgroundColor: '#007bff', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
  },
  error: { color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' },
};

export default ResetPassword;

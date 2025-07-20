import { useState } from 'react';
import axios from '../utils/axiosInstance';

function ResetPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-reset`, {
        email: form.email,
        phone: form.phone,
      });
      setStep(2);
      setMessage('✅ Utilisateur vérifié. Entrez le nouveau mot de passe.');
    } catch (err) {
      setError("❌ Utilisateur introuvable avec cet email et numéro.");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        email: form.email,
        phone: form.phone,
        newPassword: form.newPassword,
      });
      setMessage('✅ Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
      setStep(1);
      setForm({
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError("❌ Erreur lors de la réinitialisation du mot de passe.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🔁 Réinitialiser le mot de passe</h2>
        <form onSubmit={step === 1 ? handleVerify : handleReset} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="phone"
            placeholder="Votre téléphone"
            value={form.phone}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {step === 2 && (
            <>
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
            </>
          )}
          <button type="submit" style={styles.button}>
            {step === 1 ? 'Vérifier' : 'Réinitialiser'}
          </button>
        </form>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90vh',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  success: {
    color: 'green',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
};

export default ResetPassword;

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const endpoint = isLogin
      ? `${process.env.REACT_APP_API_URL}/api/auth/login`
      : `${process.env.REACT_APP_API_URL}/api/auth/register`;

    try {
      const payload = { ...form };
      if (!isLogin) delete payload.confirmPassword;

      const res = await axios.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
        window.location.reload();
      } else {
        setSuccess('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Nom complet"
                value={form.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <input
                type="text"
                name="phone"
                placeholder="Téléphone"
                value={form.phone}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            style={{
              ...styles.input,
              borderColor:
                !isLogin && error.includes('mots de passe') ? 'red' : '#ccc',
            }}
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmez le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                ...styles.input,
                borderColor:
                  error.includes('mots de passe') ? 'red' : '#ccc',
              }}
            />
          )}

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button}>
            {isLogin ? 'Se connecter' : 'S’inscrire'}
          </button>
        </form>

        <p style={{ marginTop: '1rem' }}>
          {isLogin ? "Pas de compte ?" : "Vous avez déjà un compte ?"}{' '}
          <span
            style={styles.toggle}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
          >
            {isLogin ? 'Inscription' : 'Connexion'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '85vh',
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
  toggle: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
    textAlign: 'center',
  },
};

export default AuthPage;

import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

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
    const { name, value } = e.target;

    let cleanValue = value;
    if (name === 'phone') {
      cleanValue = value.replace(/\D/g, ''); // remove non-digits
    }

    setForm((prev) => ({ ...prev, [name]: cleanValue }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Clean phone number
    const cleanedPhone = form.phone.replace(/\D/g, '');
  
    // Only allow 8 or 10 digit numbers
    if (!isLogin && (cleanedPhone.length !== 8 && cleanedPhone.length !== 10)) {
      setError('Le numéro de téléphone doit contenir 8 ou 10 chiffres.');
      return;
    }
  
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
  
    const endpoint = isLogin
      ? `${process.env.REACT_APP_API_URL}/api/auth/login`
      : `${process.env.REACT_APP_API_URL}/api/auth/register`;
  
    try {
      const payload = {
        ...form,
        phone: cleanedPhone, // save cleaned version
      };
  
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
        <h2 style={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <div style={styles.inputGroup}>
                <span style={styles.icon}>👤</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom complet"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <span style={styles.icon}>📞</span>
                <input
                  type="text"
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  style={styles.input}
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                borderColor:
                  !isLogin && error.includes('mots de passe') ? 'red' : 'transparent',
              }}
            />
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <span style={styles.icon}>🔒</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  ...styles.input,
                  borderColor:
                    error.includes('mots de passe') ? 'red' : 'transparent',
                }}
              />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button}>
            {isLogin ? 'Se connecter' : 'S’inscrire'}
          </button>

          <div style={styles.links}>
            <p>
              {isLogin ? "Pas de compte ?" : "Vous avez déjà un compte ?"}{' '}
              <span onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }} style={styles.link}>
                {isLogin ? 'Inscription' : 'Connexion'}
              </span>
            </p>
            {isLogin && (
              <Link to="/reset-password" style={styles.link}>
                🔁 Mot de passe oublié ?
              </Link>
            )}
          </div>
        </form>
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
    backgroundColor: '#f7f7f7',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
  },
  icon: {
    marginRight: '0.6rem',
    fontSize: '1.1rem',
  },
  input: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  links: {
    marginTop: '1.2rem',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
};

export default AuthPage;

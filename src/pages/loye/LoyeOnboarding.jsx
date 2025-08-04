import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeOnboarding() {
  const [step, setStep] = useState(null);
  const [role, setRole] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    const localRole = localUser?.loye?.role;

    // 🧠 Immediately redirect if user is already onboarded
    if (localRole === 'renter') {
      navigate('/loye/dashboard');
      return;
    } else if (localRole === 'owner' || localRole === 'manager') {
      navigate('/loye/properties');
      return;
    }

    const checkUserRole = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/loye/auth/check-role`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { role } = res.data;

        if (role) {
          localStorage.setItem('loyeRole', role); // ✅ Store for RequireLoyeRole to use
        }

        if (role === 'renter') {
          navigate('/loye/dashboard');
        } else if (role === 'owner' || role === 'manager') {
          navigate('/loye/properties');
        } else {
          setStep(1); // show onboarding form
        }

      } catch (err) {
        console.error('Failed to check Loye role:', err.response?.data || err.message || err);
        setStep(1);
      }
    };

    if (token) {
      checkUserRole();
    } else {
      navigate('/auth');
    }
  }, [navigate, token]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/loye/invite`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const onboardedRole = res.data.role;

      const updatedUser = {
        ...user,
        loye: {
          role: onboardedRole,
          onboarded: true,
        },
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (onboardedRole === 'renter') {
        navigate('/loye/dashboard');
      } else {
        navigate('/loye/properties');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/loye/auth/register-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/loye/properties');
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === null) return null;

  if (step === 1) {
    return (
      <div style={styles.container}>
        <h2>Bienvenue sur Loye</h2>
        <p>Choisissez votre rôle :</p>
        <div style={styles.roles}>
          <button onClick={() => { setRole('renter'); setStep(2); }} style={styles.button}>Locataire</button>
          <button onClick={() => { setRole('owner'); setStep(3); }} style={styles.button}>Propriétaire</button>
          <button onClick={() => { setRole('manager'); setStep(3); }} style={styles.button}>Gestionnaire</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={styles.container}>
        <h2>Accès à Loye</h2>
        <p>Entrez votre code d’accès :</p>
        <form onSubmit={handleInviteSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Code (ex: REN-XXXX)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Vérification...' : 'Valider'}
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={styles.container}>
        <h2>Invité ou création directe ?</h2>
        <p>Souhaitez-vous utiliser un code d'invitation ?</p>
        <div style={styles.roles}>
          <button onClick={() => setStep(2)} style={styles.button}>J’ai un code</button>
          <button onClick={handleSkip} style={styles.button} disabled={loading}>
            {loading ? 'Traitement...' : 'Continuer sans code'}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return null;
}

const styles = {
  container: {
    maxWidth: '420px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  form: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  roles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  input: {
    padding: '0.7rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.7rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    marginTop: '1rem',
    color: 'red',
  },
};

export default LoyeOnboarding;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeOnboarding() {
  const [step, setStep] = useState(null); // null until role check is done
  const [role, setRole] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // ✅ Auto-redirect if already onboarded
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/loye/check-role`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { role } = res.data;

        if (role === 'renter') {
          navigate('/loye/dashboard');
        } else if (role === 'owner' || role === 'manager') {
          navigate('/loye/properties');
        } else {
          setStep(1); // not linked yet
        }
      } catch (err) {
        console.error('Failed to check Loye role:', err);
        setStep(1); // fallback
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

  const handleSkip = () => {
    const updatedUser = {
      ...user,
      loye: {
        role,
        onboarded: true,
      },
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    navigate('/loye/properties');
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
          <button onClick={handleSkip} style={styles.button}>Continuer sans code</button>
        </div>
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

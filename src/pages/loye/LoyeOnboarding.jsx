import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { FaHome, FaBuilding, FaUsers } from 'react-icons/fa';

function LoyeOnboarding() {
  const [step, setStep] = useState(null);
  const [role, setRole] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    const localRole = localUser?.loye?.role;

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
          const user = JSON.parse(localStorage.getItem('user'));
          const updatedUser = {
            ...user,
            loye: {
              role,
              onboarded: true,
            },
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('loyeRole', role);
        }

        if (role === 'renter') {
          navigate('/loye/dashboard');
        } else if (role === 'owner' || role === 'manager') {
          navigate('/loye/properties');
        } else {
          setStep(1);
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
      const user = JSON.parse(localStorage.getItem('user'));
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

  // 👇 STEP 1: Role Selection — now using card-style UI
  if (step === 1) {
    const roles = [
      {
        id: 'renter',
        title: 'Locataire',
        description: 'Je souhaite me connecter à mon propriétaire pour commencer à payer mon loyer en ligne',
        icon: <FaHome size={32} color="#3B82F6" />,
        color: '#3B82F6',
      },
      {
        id: 'owner',
        title: 'Propriétaire',
        description: 'Je possède des biens immobiliers et je souhaite permettre à mes locataires de payer leur loyer en ligne.',
        icon: <FaBuilding size={32} color="#10B981" />,
        color: '#10B981',
      },
      {
        id: 'manager',
        title: 'Gestionnaire',
        description: 'Je gère des biens immobiliers pour plusieurs propriétaires et je souhaite permettre à leurs locataires de payer leur loyer en ligne.',
        icon: <FaUsers size={32} color="#F97316" />,
        color: '#F97316',
      }
    ];

    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Bienvenue sur Loye</h2>
        <p style={styles.subheading}>Choisissez votre rôle pour commencer</p>

        <div style={styles.grid}>
          {roles.map((r) => (
            <div key={r.id} style={styles.card}>
              <div style={{ ...styles.iconBox, backgroundColor: r.color + '20' }}>{r.icon}</div>
              <h3 style={styles.cardTitle}>{r.title}</h3>
              <p style={styles.cardDesc}>{r.description}</p>
              <button
                style={{ ...styles.cardBtn, backgroundColor: r.color }}
                onClick={() => {
                  setRole(r.id);
                  setStep(r.id === 'renter' ? 2 : 3);
                }}
              >
                Choisir ce rôle
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 👇 STEP 2: Invite Code
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

  // 👇 STEP 3: Invite or not
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
    maxWidth: '1100px',
    margin: '3rem auto',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  subheading: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '2rem',
  },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    width: '300px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  iconBox: {
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '1.5rem',
  },
  cardBtn: {
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1.2rem',
    fontSize: '1rem',
    cursor: 'pointer',
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

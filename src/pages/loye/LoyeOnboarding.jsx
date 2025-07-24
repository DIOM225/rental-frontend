import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function LoyeOnboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
 
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user?.loye?.role === 'renter') {
      navigate('/loye/dashboard');
    } else if (user?.loye?.role === 'owner' || user?.loye?.role === 'manager') {
      navigate('/loye/properties');
    }
  }, [navigate, user]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'renter') {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleInviteDecision = (answer) => {
    if (answer === 'yes') {
      
      setStep(2);
    } else {
      // Proceed directly without invite code
      localStorage.setItem(
        'user',
        JSON.stringify({ ...user, loye: { role } })
      );
      navigate('/loye/properties');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const res = await axios.post(
        '/api/loye/invite', // ✅ correct route
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedUser = { ...user, loye: { role: res.data.role } };
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      if (res.data.role === 'renter') {
        navigate('/loye/dashboard');
      } else {
        navigate('/loye/properties');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Une erreur est survenue. Réessayez.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={styles.container}>
      <h2>Accès à Loye</h2>

      {step === 1 && (
        <>
          <p>Vous Etre ?</p>
          <div style={styles.buttonGroup}>
            <button onClick={() => handleRoleSelect('renter')} style={styles.button}>Locataire</button>
            <button onClick={() => handleRoleSelect('owner')} style={styles.button}>Propriétaire</button>
            <button onClick={() => handleRoleSelect('manager')} style={styles.button}>Gestionnaire</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p>Avez-vous reçu un code d'invitation ?</p>
          <div style={styles.buttonGroup}>
            <button onClick={() => handleInviteDecision('yes')} style={styles.button}>Oui</button>
            <button onClick={() => handleInviteDecision('no')} style={styles.button}>Non</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p>Entrez votre code d'accès {role === 'renter' ? 'Loye' : 'd’invitation'} :</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Code (ex: 2B-GX9P7F)"
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
        </>
      )}
    </div>
  );
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
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  form: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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

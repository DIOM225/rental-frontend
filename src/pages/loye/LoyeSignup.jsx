import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoyeSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'renter',
    apartmentCode: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/loye/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        alert('Compte créé avec succès ! Veuillez vous connecter.');
        navigate('/loye/login');
      }
    } catch (err) {
      setError('Erreur de serveur');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Créer un compte Loye</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone"
          value={formData.phone}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
          <option value="renter">Locataire</option>
          <option value="manager">Gestionnaire</option>
          <option value="owner">Propriétaire</option>
        </select>

        {formData.role === 'renter' && (
          <input
            type="text"
            name="apartmentCode"
            placeholder="Code d'appartement"
            value={formData.apartmentCode}
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>Créer un compte</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  }
};

export default LoyeSignup;

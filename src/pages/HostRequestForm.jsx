import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function HostRequestForm() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [errors, setErrors] = useState({});

  const validatePhone = (num) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 8 || cleaned.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\D/g, '');
    const cleanedConfirm = confirmPhone.replace(/\D/g, '');

    const newErrors = {};
    if (!validatePhone(phone)) {
      newErrors.phone = 'Le numéro doit contenir 8 ou 10 chiffres.';
    }
    if (cleanedPhone !== cleanedConfirm) {
      newErrors.confirmPhone = 'Les numéros ne correspondent pas.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('phone', cleanedPhone);
      if (idImage) formData.append('idImage', idImage);

      await axios.post(
        'https://rental-backend-uqo8.onrender.com/api/requests',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Demande envoyée avec succès.');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la demande');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Demander l'autorisation pour publier</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Numéro de téléphone:
          <input
            type="text"
            placeholder="ex: 0749494406"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={styles.input}
          />
          {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        </label>

        <label>
          Confirmer le numéro:
          <input
            type="text"
            placeholder="Re-saisir le numéro"
            value={confirmPhone}
            onChange={(e) => setConfirmPhone(e.target.value)}
            required
            style={styles.input}
          />
          {errors.confirmPhone && (
            <span style={styles.error}>{errors.confirmPhone}</span>
          )}
        </label>

        <label>
          Carte d'identité (optionnelle):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIdImage(e.target.files[0])}
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>
          Envoyer la demande
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    fontWeight: 600,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    marginTop: '0.3rem',
    width: '100%',
  },
  button: {
    padding: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '0.3rem',
    display: 'block',
  },
};

export default HostRequestForm;

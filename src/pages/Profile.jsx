import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profilePic: '',
    idImage: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          bio: data.bio || '',
          profilePic: data.profilePic || 'https://i.pravatar.cc/150?img=12',
          idImage: data.idImage || ''
        });
      } catch (err) {
        console.error('❌ Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'diom_unsigned');

    const res = await fetch('https://api.cloudinary.com/v1_1/dgpzat6o4/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (type === 'profile') {
      setForm((prev) => ({ ...prev, profilePic: data.secure_url }));
    } else if (type === 'id') {
      setForm((prev) => ({ ...prev, idImage: data.secure_url }));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/api/profile/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Profil mis à jour');
      setProfile(data);
      setEditing(false);
    } catch (err) {
      console.error('❌ Échec MAJ:', err);
      alert('Erreur MAJ profil');
    }
  };

  if (loading) return <p style={styles.center}>Chargement...</p>;
  if (!profile) return <p style={styles.center}>Erreur chargement profil.</p>;

  const renderInput = (name, label, isTextArea = false) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          disabled={!editing}
          rows={3}
          style={{
            ...styles.input,
            ...styles.textarea,
            ...(editing ? styles.editable : {}),
          }}
        />
      ) : (
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          disabled={name === 'email' || !editing}
          style={{
            ...styles.input,
            ...(name === 'email' ? styles.disabled : {}),
            ...(editing && name !== 'email' ? styles.editable : {}),
          }}
        />
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Avatar */}
        <div style={styles.avatarBox}>
          <img src={form.profilePic} alt="avatar" style={styles.avatar} />
          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'profile')}
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </div>

        <h2 style={styles.title}>👤 Mon Profil</h2>

        {renderInput('name', 'Nom')}
        {renderInput('email', 'Email')}
        {renderInput('phone', 'Téléphone')}
        {renderInput('bio', 'Bio', true)}

        {/* ID Upload */}
        {editing && (
          <div style={styles.field}>
            <label style={styles.label}>📄 Carte d'identité (facultatif)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'id')} />
            {form.idImage && (
              <img src={form.idImage} alt="ID" style={{ marginTop: '1rem', maxWidth: '100%', borderRadius: '8px' }} />
            )}
          </div>
        )}

        <button
          onClick={editing ? handleUpdate : () => setEditing(true)}
          style={editing ? styles.btn : styles.btnOutline}
        >
          {editing ? '💾 Sauvegarder' : '✏️ Modifier'}
        </button>
      </div>
    </div>
  );
};

const baseInput = {
  width: '100%',
  padding: '0.65rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: '#f9f9f9',
};

const styles = {
  container: { padding: '2rem', display: 'flex', justifyContent: 'center', backgroundColor: '#f7f9fc', minHeight: '100vh' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  center: { textAlign: 'center', padding: '2rem' },
  title: { textAlign: 'center', fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#333' },
  input: baseInput,
  textarea: { resize: 'vertical' },
  disabled: { backgroundColor: '#f0f0f0', color: '#999', borderColor: '#eee' },
  editable: { backgroundColor: '#fff', border: '1px solid #007bff' },
  btn: { ...baseInput, backgroundColor: '#007bff', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' },
  btnOutline: { ...baseInput, backgroundColor: 'white', color: '#007bff', border: '2px solid #007bff', fontWeight: '600', cursor: 'pointer' },
  avatarBox: { position: 'relative', textAlign: 'center', marginBottom: '1.5rem' },
  avatar: { width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e0e0e0' },
};

export default Profile;

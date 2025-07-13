import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import axiosBase from 'axios';
import { useNavigate } from 'react-router-dom';

function AddListing() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('monthly');
  const [images, setImages] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPhoneOnFile, setHasPhoneOnFile] = useState(false);
  const [discountPrice, setDiscountPrice] = useState('');
  const [isApproved, setIsApproved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://rental-backend-uqo8.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsApproved(res.data.approved);
        if (res.data.phone) {
          setPhone(res.data.phone.replace('+225', ''));
          setHasPhoneOnFile(true);
        }
      } catch (err) {
        console.error('Erreur récupération utilisateur :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'diom_unsigned');
    const res = await axiosBase.post(
      'https://api.cloudinary.com/v1_1/dgpzat6o4/image/upload',
      formData
    );
    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[0-9]+$/.test(phone) || (phone.length !== 10 && phone.length !== 8)) {
      alert("Le numéro doit contenir 8 ou 10 chiffres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const reorderedImages = [images[thumbnailIndex], ...images.filter((_, idx) => idx !== thumbnailIndex)];
      const uploadedImageUrls = await Promise.all(reorderedImages.map(file => uploadImageToCloudinary(file)));

      const newListing = {
        title,
        address,
        city,
        commune,
        type,
        price: Number(price),
        discountPrice: discountPrice || null,
        images: uploadedImageUrls,
        description,
        phone: `+225${phone}`,
      };

      await axios.post('https://rental-backend-uqo8.onrender.com/api/listings', newListing, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Annonce ajoutée avec succès !');
      navigate('/my-listings');
    } catch (error) {
      console.error('❌ Erreur création annonce:', error);
      alert("Erreur lors de l'ajout de l'annonce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Chargement...</p>;

  if (!isApproved) {
    navigate('/request-host');
    return null;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ajouter une annonce</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required style={styles.input} />

        <div style={styles.grid2}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ marginRight: 4 }}>FCFA</span>
            <input type="number" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} required style={styles.input} />
            <input type="number" placeholder="Prix remisé" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} style={styles.input} />
          </div>

          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
            <option value="monthly">Mensuel</option>
            <option value="daily">Residence</option>
          </select>
        </div>

        <div style={styles.grid2}>
          <input type="text" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
          <input type="text" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} required style={styles.input} />
        </div>

        <input type="text" placeholder="Commune" value={commune} onChange={(e) => setCommune(e.target.value)} required style={styles.input} />

        {hasPhoneOnFile ? (
          <input type="text" value={`+225${phone}`} disabled style={{ ...styles.input, backgroundColor: '#f5f5f5' }} />
        ) : (
          <input type="text" placeholder="Numéro de téléphone (ex: 0749494406)" value={phone} onChange={(e) => setPhone(e.target.value)} required style={styles.input} />
        )}

        <textarea placeholder="Description détaillée du logement..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required style={{ ...styles.input, resize: 'vertical' }} />

        <input type="file" multiple accept="image/*" onChange={(e) => setImages(prev => [...prev, ...Array.from(e.target.files)])} style={styles.input} />

        {images.length > 0 && (
          <div style={styles.previewGrid}>
            {images.map((file, idx) => (
              <div key={idx} style={{ ...styles.previewWrapper, border: idx === thumbnailIndex ? '2px solid #007bff' : '1px solid #ccc' }}>
                <img src={URL.createObjectURL(file)} alt={`preview ${idx}`} style={styles.previewImage} onClick={() => setThumbnailIndex(idx)} />
                {idx === thumbnailIndex && <div style={styles.thumbnailTag}>Principale</div>}
                <button type="button" onClick={() => {
                  setImages(prev => prev.filter((_, i) => i !== idx));
                  if (idx === thumbnailIndex) setThumbnailIndex(0);
                  else if (idx < thumbnailIndex) setThumbnailIndex(prev => prev - 1);
                }} style={styles.deleteButton}>×</button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? <span className="loader"></span> : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '650px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  grid2: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    minWidth: '0',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  previewGrid: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  previewWrapper: {
    position: 'relative',
    borderRadius: '6px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  previewImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    display: 'block',
  },
  thumbnailTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '0.75rem',
    textAlign: 'center',
    padding: '2px 0',
  },
  deleteButton: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
    cursor: 'pointer',
  },
};

export default AddListing;

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const messageRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/${id}`);
        const listing = res.data;
        const user = JSON.parse(localStorage.getItem('user'));

        if (!listing) {
          alert("Listing introuvable");
          navigate('/');
          return;
        }

        if (listing.userId !== user._id && user.role !== 'admin') {
          alert("Vous n'avez pas la permission de modifier cette annonce.");
          navigate('/');
          return;
        }

        setForm({
          title: listing.title,
          address: listing.address || '',
          city: listing.city || '',
          commune: listing.commune || '',
          price: listing.price || '',
          discountPrice: listing.discountPrice || '',
          pieces: listing.pieces || '',
          type: listing.type || 'monthly',
          images: listing.images || [],
          description: listing.description || '',
        });
        setThumbnailIndex(0);
      } catch (err) {
        console.error('❌ Erreur chargement annonce:', err);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleImageRemove = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: newImages }));
    if (index === thumbnailIndex) setThumbnailIndex(0);
    else if (index < thumbnailIndex) setThumbnailIndex((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reordered = [form.images[thumbnailIndex], ...form.images.filter((_, i) => i !== thumbnailIndex)];
      const updatedForm = { ...form, images: reordered };

      if (updatedForm.discountPrice === '') {
        delete updatedForm.discountPrice;
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/api/listings/${id}`, updatedForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg('✅ Annonce mise à jour avec succès !');
      messageRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setErrorMsg('❌ Échec de la mise à jour. Veuillez réessayer.');
      messageRef.current?.scrollIntoView({ behavior: 'smooth' });
      console.error(err);
    }
  };

  if (!form) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Modifier l'annonce</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" />
        <input name="city" value={form.city} onChange={handleChange} placeholder="Ville" required />
        <input name="commune" value={form.commune} onChange={handleChange} placeholder="Commune" required />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Prix" required />

        <input
          name="discountPrice"
          type="number"
          value={form.discountPrice}
          onChange={handleChange}
          placeholder="Prix promotionnel (optionnel)"
          min="0"
        />

        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="monthly">Mensuel</option>
          <option value="daily">Journalière</option>
        </select>

        <select name="pieces" value={form.pieces} onChange={handleChange} required>
          <option value="">Nombre de pièces</option>
          <option value="Studio">Studio</option>
          <option value="1 Pièce">1 Pièce</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4+">4+</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="Description détaillée du logement"
          style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />

        {form.images.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {form.images.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', border: idx === thumbnailIndex ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '6px' }}>
                <img
                  src={url}
                  alt={`img-${idx}`}
                  onClick={() => setThumbnailIndex(idx)}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                />
                {idx === thumbnailIndex && (
                  <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#007bff' }}>Principale</div>
                )}
                <button type="button" onClick={() => handleImageRemove(idx)} style={{
                  position: 'absolute', top: 2, right: 2, background: 'red', color: 'white',
                  border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer'
                }}>×</button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '1rem', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' }}>
          Mettre à jour
        </button>
      </form>

      <div ref={messageRef} style={{ marginTop: '1rem', textAlign: 'center' }}>
        {successMsg && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMsg}</p>}
        {errorMsg && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMsg}</p>}
      </div>
    </div>
  );
}

export default EditListing;

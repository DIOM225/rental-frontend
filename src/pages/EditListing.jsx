import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
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
          type: listing.type || 'monthly',
          images: listing.images || [''],
          description: listing.description || '',
        });
      } catch (err) {
        console.error('❌ Erreur chargement annonce:', err);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/listings/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Annonce mise à jour !');
      navigate('/my-listings');
    } catch (err) {
      alert('❌ Échec de la mise à jour');
      console.error(err);
    }
  };

  if (!form) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Modifier l'annonce</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}
      >
        <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" />
        <input name="city" value={form.city} onChange={handleChange} placeholder="Ville" required />
        <input name="commune" value={form.commune} onChange={handleChange} placeholder="Commune" required />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Prix" required />

        <input
          name="image"
          value={form.images?.[0] || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, images: [e.target.value] }))}
          placeholder="Image URL"
          required
        />

        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="monthly">Mensuel</option>
          <option value="daily">Journalière</option>
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

        <button
          type="submit"
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '1rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
}

export default EditListing;

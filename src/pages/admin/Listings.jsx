import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://rental-backend-uqo8.onrender.com/api/admin/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data);
    } catch (err) {
      console.error('❌ Failed to load listings:', err);
      alert('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Supprimer cette annonce ?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://rental-backend-uqo8.onrender.com/api/admin/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      console.error('❌ Failed to delete listing:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getThumbnail = (listing) => {
    if (listing.image) return listing.image;
    if (Array.isArray(listing.images) && listing.images.length > 0) return listing.images[0];
    return null;
  };

  if (loading) return <p style={{ padding: '2rem' }}>Chargement des annonces...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Annonces</h2>

      {listings.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listings.map((l) => {
            const imageUrl = getThumbnail(l);

            return (
              <li key={l._id} style={styles.card}>
                <div style={styles.info}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={l.title}
                      style={styles.image}
                    />
                  )}
                  <div>
                    <strong>{l.title}</strong> – {l.city || ''} – ${l.price}
                    <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', color: '#555' }}>
                      {l.userId?.name && <>👤 {l.userId.name}<br /></>}
                      {l.userId?.phone && <>📞 {l.userId.phone}</>}
                    </div>
                  </div>

                </div>
                <button onClick={() => handleDelete(l._id)} style={styles.deleteButton}>
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  image: {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Listings;

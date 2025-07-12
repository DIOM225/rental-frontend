import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

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

  // 👁️ Log whenever a listing is selected
  useEffect(() => {
    if (selectedListing) {
      console.log('📦 Selected listing:', selectedListing);
    }
  }, [selectedListing]);

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

  const closeModal = () => setSelectedListing(null);

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
              <li
                key={l._id}
                style={styles.card}
                onClick={() => setSelectedListing(l)}
              >
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
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening modal
                    handleDelete(l._id);
                  }}
                  style={styles.deleteButton}
                >
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedListing && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Détails de l’annonce</h3>
            <p><strong>Titre:</strong> {selectedListing.title}</p>
            <p><strong>Ville:</strong> {selectedListing.city}</p>
            <p><strong>Prix:</strong> ${selectedListing.price}</p>
            {selectedListing.userId?.name && (
              <p><strong>👤 Nom:</strong> {selectedListing.userId.name}</p>
            )}
            {selectedListing.userId?.phone && (
              <p><strong>📞 Téléphone:</strong> {selectedListing.userId.phone}</p>
            )}
            <button onClick={closeModal} style={styles.closeButton}>Fermer</button>
          </div>
        </div>
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
    alignItems: 'center',
    cursor: 'pointer'
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
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  closeButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    background: '#333',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Listings;

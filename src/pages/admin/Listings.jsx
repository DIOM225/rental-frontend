import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editorRatings, setEditorRatings] = useState({});
  const [saveSuccess, setSaveSuccess] = useState({});

  // ───────────────────── Fetch Listings (wrapped in effect) ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          'https://rental-backend-uqo8.onrender.com/api/listings/admin/listings',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListings(res.data);
      } catch (err) {
        console.error('❌ Failed to load listings:', err);
        alert('Erreur lors du chargement des annonces');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ───────────────────── Pre-fill ratings when listings load ─────────────────────
  useEffect(() => {
    const initialRatings = {};
    listings.forEach(l => {
      initialRatings[l._id] = l.editorRating ?? '';
    });
    setEditorRatings(initialRatings);
  }, [listings]);

  // ───────────────────── Handle rating input change ─────────────────────
  const handleRatingChange = (id, value) => {
    setEditorRatings(prev => ({ ...prev, [id]: value }));
  };

  const saveEditorRating = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/listings/${id}`,
        { editorRating: Number(editorRatings[id]) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaveSuccess(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSaveSuccess(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  // ───────────────────── Delete Listing ─────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://rental-backend-uqo8.onrender.com/api/admin/listings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      console.error('❌ Failed to delete listing:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const closeModal = () => setSelectedListing(null);

  if (loading) return <p style={{ padding: '2rem' }}>Chargement des annonces…</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Annonces</h2>

      {listings.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listings.map(l => {
            const thumb = l.image || (Array.isArray(l.images) && l.images[0]);
            const ratingValue = editorRatings[l._id] ?? '';

            return (
              <li
                key={l._id}
                style={styles.card}
                onClick={() => setSelectedListing(l)}
              >
                <div style={styles.left}>
                  {thumb && <img src={thumb} alt={l.title} style={styles.thumb} />}
                  <div>
                    <strong>{l.title}</strong> – {l.city ?? ''} – {l.price} FCFA
                    <div style={{ marginTop: '0.4rem' }}>
                      Note&nbsp;
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={ratingValue}
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleRatingChange(l._id, e.target.value)}
                        style={{ width: 60, marginRight: 6 }}
                      />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          saveEditorRating(l._id);
                        }}
                        style={styles.saveBtn}
                      >
                        💾
                      </button>
                      {saveSuccess[l._id] && (
                        <span style={{ marginLeft: 6, color: 'green' }}>✅</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(l._id);
                  }}
                  style={styles.deleteBtn}
                >
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedListing && (
        <div style={styles.backdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{selectedListing.title}</h3>
            <p><strong>Ville :</strong> {selectedListing.city}</p>
            <p><strong>Prix :</strong> {selectedListing.price} FCFA</p>
            {selectedListing.userId?.name && <p><strong>👤</strong> {selectedListing.userId.name}</p>}
            {selectedListing.userId?.phone && <p><strong>📞</strong> {selectedListing.userId.phone}</p>}
            <button onClick={closeModal} style={styles.closeBtn}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Styles ───────────────────── */
const styles = {
  card: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: 6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  left: { display: 'flex', gap: 12 },
  thumb: {
    width: 80,
    height: 60,
    objectFit: 'cover',
    borderRadius: 4
  },
  saveBtn: {
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.25rem 0.5rem',
    cursor: 'pointer'
  },
  deleteBtn: {
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.5rem 1rem',
    cursor: 'pointer'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: 8,
    maxWidth: 400,
    width: '90%'
  },
  closeBtn: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    background: '#333',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer'
  }
};

export default Listings;

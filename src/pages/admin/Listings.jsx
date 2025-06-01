import { useEffect, useState } from 'react';
import axios from 'axios';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5050/api/admin/listings', {
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
      await axios.delete(`http://localhost:5050/api/admin/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      console.error('❌ Failed to delete listing:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Chargement des annonces...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Annonces</h2>

      {listings.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listings.map((l) => (
            <li key={l._id} style={styles.card}>
              <div>
                <strong>{l.title}</strong> – {l.city} – ${l.price}
              </div>
              <button onClick={() => handleDelete(l._id)} style={styles.deleteButton}>
                Supprimer
              </button>
            </li>
          ))}
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

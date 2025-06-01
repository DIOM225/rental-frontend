import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HostDashboard() {
  const [listings, setListings] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://localhost:5050/api/listings/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setListings(res.data))
      .catch((err) => console.error('❌ Error loading listings', err));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await axios.delete(`http://localhost:5050/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎛️ Gestion des Annonces</h2>

      {listings.length === 0 ? (
        <div style={styles.empty}>
          <p>Vous n'avez aucune annonce.</p>
          <Link to="/add" style={styles.addBtn}>➕ Ajouter une annonce</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {listings.map(({ _id, title, city, price, type, createdAt, images, status }) => (
            <div key={_id} style={styles.card}>
              <img
                src={images?.[0] || '/default.jpg'}
                alt="listing"
                style={styles.image}
              />
              <div style={styles.details}>
                {status && (
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: status === 'published' ? '#28a745' : '#ffc107',
                      color: status === 'published' ? '#fff' : '#333',
                    }}
                  >
                    {status === 'published' ? 'Publié' : 'En attente'}
                  </span>
                )}
                <h3>{title}</h3>
                <p style={styles.meta}>
                  {city} • ${price} •{' '}
                  <span style={type === 'daily' ? styles.tagDaily : styles.tagMonthly}>
                    {type === 'daily' ? 'Journalier' : 'Mensuel'}
                  </span>
                </p>
                <p style={styles.date}>Ajouté le {new Date(createdAt).toLocaleDateString()}</p>
              </div>

              <div style={styles.actions}>
                <Link to={`/edit/${_id}`} style={styles.editBtn}>✏️ Modifier</Link>
                <button onClick={() => handleDelete(_id)} style={styles.deleteBtn}>🗑 Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '2rem',
  },
  empty: {
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: '2rem',
    borderRadius: '8px',
  },
  addBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  details: {
    padding: '1rem',
    flex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  },
  meta: {
    color: '#666',
    fontSize: '0.95rem',
    marginTop: '0.4rem',
  },
  date: {
    fontSize: '0.8rem',
    color: '#aaa',
    marginTop: '0.5rem',
  },
  tagMonthly: {
    backgroundColor: '#17a2b8',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  tagDaily: {
    backgroundColor: '#ffc107',
    color: '#000',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem 1rem',
    borderTop: '1px solid #eee',
  },
  editBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.4rem 0.8rem',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default HostDashboard;

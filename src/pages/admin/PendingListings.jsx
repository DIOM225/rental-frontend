import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PendingListings() {
  const [listings, setListings] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('https://rental-backend-uqo8.onrender.com/api/admin/pending-listings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setListings(res.data))
    .catch(err => console.error('❌ Failed to load pending listings:', err));
  }, [token]);

  const handleAction = async (id, status, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await axios.put(`https://rental-backend-uqo8.onrender.com/api/admin/listings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(prev => prev.filter(listing => listing._id !== id));
    } catch (err) {
      console.error('❌ Failed to update listing status:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Pending Listings</h2>
      {listings.length === 0 ? (
        <p>No pending listings at the moment.</p>
      ) : (
        listings.map(listing => (
          <Link
            key={listing._id}
            to={`/admin/listing/${listing._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={styles.card}>
              <div style={styles.imageWrapper}>
                <img src={listing.images[0]} alt={listing.title} style={styles.image} />
              </div>
              <div style={styles.content}>
                <h3>{listing.title}</h3>
                <p><strong>City:</strong> {listing.city} - {listing.commune}</p>
                <p><strong>Type:</strong> {listing.type === 'daily' ? 'Daily' : 'Monthly'}</p>
                <p><strong>Price:</strong> {listing.price} FCFA</p>
                <p>{listing.description.slice(0, 120)}...</p>
                <div style={styles.actions}>
                  <button onClick={(e) => handleAction(listing._id, 'published', e)} style={styles.approve}>✅ Approve</button>
                  <button onClick={(e) => handleAction(listing._id, 'rejected', e)} style={styles.reject}>❌ Reject</button>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    gap: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    padding: '1rem',
    marginBottom: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease',
  },
  imageWrapper: {
    flex: '0 0 180px'
  },
  image: {
    width: '180px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  content: {
    flex: 1
  },
  actions: {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem'
  },
  approve: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  reject: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default PendingListings;

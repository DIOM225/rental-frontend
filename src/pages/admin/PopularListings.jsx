import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

import ListingCard from '../../components/ListingCard';

function PopularListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPopularListings = async () => {
      try {
        const res = await axios.get('https://rental-backend-uqo8.onrender.com/api/admin/popular-listings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setListings(res.data);
      } catch (err) {
        console.error('❌ Error fetching popular listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularListings();
  }, [token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📈 Annonces les plus populaires (clics WhatsApp)</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : listings.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularListings;

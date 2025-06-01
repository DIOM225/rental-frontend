import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

function Daily() {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const didMountRef = useRef(false);

  const fetchListings = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5050/api/listings?type=daily&page=${page}&limit=6&search=${searchQuery}`
      );
      const newListings = res.data.listings || [];

      setListings((prev) => {
        const combined = [...prev, ...newListings];
        return combined.filter(
          (item, index, self) =>
            index === self.findIndex((l) => l._id === item._id)
        );
      });

      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, hasMore, loading]);

  // Reset when searchQuery changes
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setListings([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        fetchListings();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchListings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
        Locations Journalières
      </h2>

      <form
        onSubmit={handleSearchSubmit}
        style={{ marginBottom: '2rem', width: '100%', maxWidth: '500px', marginInline: 'auto' }}
      >
        <input
          type="text"
          value={inputValue}
          placeholder="Rechercher par commune..."
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </form>

      {listings.length === 0 && !loading && (
        <p style={{ textAlign: 'center' }}>Aucune annonce journalière trouvée.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {loading && <p>Chargement...</p>}
        {!hasMore && <p>Aucune autre annonce à charger.</p>}
      </div>
    </div>
  );
}

export default Daily;

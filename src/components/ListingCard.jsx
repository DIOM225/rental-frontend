import { Link } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa6';

function renderStars(avgRating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= avgRating ? <FaStar key={i} color="#ffc107" /> : <FaRegStar key={i} color="#ccc" />);
  }
  return stars;
}

function ListingCard({ listing, showStatus = false }) {
  if (!listing) return null;

  const { _id, title, city, commune, type, price, images, reviews = [], status } = listing;

  const mainImage =
    images && images.length > 0
      ? images[0]
      : listing.image || 'https://via.placeholder.com/400x300?text=No+Image';

  const avgRating =
    reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
      : 0;

  return (
    <Link to={`/listing/${_id}`} style={styles.linkWrapper}>
      <div style={styles.card}>
        <img src={mainImage} alt={title} style={styles.image} />

        <div style={styles.details}>
          {/* ✅ Status badge (optional) */}
          {showStatus && status && (
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

          <h3 style={styles.title}>{title}</h3>

          <div style={styles.stars}>
            {renderStars(avgRating)}
          </div>

          {/* 🏙️ City and Commune */}
          <p style={styles.address}>
            📍 {[city, commune].filter(Boolean).join(' • ')}
          </p>

          <p style={styles.type}>{type === 'monthly' ? 'Mensuel' : 'Journalier'}</p>
          <p style={styles.price}>${price} {type === 'monthly' ? '/mois' : '/jour'}</p>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  linkWrapper: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    width: '100%',
    maxWidth: '360px',
    margin: '1rem auto',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  details: {
    padding: '1rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '4px',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
  },
  stars: {
    display: 'flex',
    gap: '0.2rem',
    marginBottom: '0.5rem',
  },
  address: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.3rem',
  },
  type: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#007bff',
    marginBottom: '0.3rem',
  },
  price: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#28a745',
  },
};

export default ListingCard;

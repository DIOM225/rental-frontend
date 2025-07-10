import { Link } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa6';

function optimizeImage(url, width, height) {
  if (!url) return '';
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
}

function renderStars(avgRating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= avgRating ? <FaStar key={i} color="#ffc107" /> : <FaRegStar key={i} color="#ccc" />);
  }
  return stars;
}

function ListingCard({ listing, showStatus = false }) {
  if (!listing) return null;

  const { _id, title, city, commune, type, price, images, reviews = [], status, discountPrice } = listing;

  const mainImage = images && images.length > 0
    ? images[0]
    : listing.image || 'https://via.placeholder.com/400x300?text=No+Image';

  const avgRating =
    reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
      : 0;

  const percentOff = discountPrice
    ? Math.round((1 - discountPrice / price) * 100)
    : 0;

  return (
    <Link to={`/listing/${_id}`} style={styles.linkWrapper}>
      <div style={styles.card}>
        <div style={styles.imageWrapper}>
          <img
            src={optimizeImage(mainImage, 400, 250)}
            width={400}
            height={250}
            style={styles.image}
            loading="lazy"
            alt={title}
          />

          {/* 🔖 Promo badge overlay */}
          {discountPrice && (
            <div style={styles.promoBadge}>
              -{percentOff}%
            </div>
          )}
        </div>

        <div style={styles.details}>
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

          <div style={styles.stars}>{renderStars(avgRating)}</div>

          <p style={styles.address}>
            📍 {[city, commune].filter(Boolean).join(' • ')}
          </p>

          <p style={styles.type}>{type === 'monthly' ? 'Mensuel' : 'Journalier'}</p>

          <p style={styles.price}>
            {parseInt(discountPrice || price).toLocaleString()} FCFA {type === 'monthly' ? '/mois' : '/jour'}
          </p>
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
    maxWidth: '320px',
    margin: '0 auto',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  promoBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 1,
  },
  details: {
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  badge: {
    fontSize: '0.6rem',
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: '3px',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '600',
    lineHeight: '1.1',
    margin: 0,
  },
  stars: {
    display: 'flex',
    gap: '0.1rem',
    fontSize: '0.7rem',
    margin: 0,
  },
  address: {
    fontSize: '0.75rem',
    color: '#555',
    margin: 0,
    lineHeight: '1.1',
  },
  type: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#007bff',
    margin: 0,
  },
  price: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#28a745',
    margin: 0,
  },
};

export default ListingCard;

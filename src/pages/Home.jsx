import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const CardSection = lazy(() => import('./CardSection'));

function Home() {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.overlay}></div>
        <div style={styles.content}>
          <h1 style={styles.title}>Akwaaba</h1>
          <p style={styles.subtitle}>
            Trouvez et réservez facilement un logement pour une nuit, un mois ou plus en toute sécurité !
          </p>

          <div style={styles.buttons}>
            <Link to="/daily" style={styles.button}>Residence Meuble</Link>
            <Link to="/monthly" style={styles.button}>Locations Mensuelles</Link>
          </div>
        </div>
      </section>

      {/* Lazy-loaded card section */}
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>}>
        <CardSection />
      </Suspense>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    overflowX: 'hidden',
  },
  hero: {
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url(https://res.cloudinary.com/dgpzat6o4/image/upload/w_800,f_auto,q_auto/v1745512741/IMG_1108_ardmlj.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    color: 'white',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: '1rem',
    maxWidth: '90vw',
    margin: '0 auto',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    marginBottom: '1rem',
    fontWeight: 'bold',
    textShadow: '3px 3px 8px rgba(0,0,0,0.9)',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    marginBottom: '2rem',
    lineHeight: '1.4',
    textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '1rem',
  },
  button: {
    backgroundColor: '#007bff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s, transform 0.3s',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
  },
};

export default Home;

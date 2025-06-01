import { Link } from 'react-router-dom';

function Home() {
  // Responsive tweak
  const isMobile = window.innerWidth <= 768;

  return (
    <div style={styles.hero}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={{ ...styles.title, fontSize: isMobile ? '2rem' : '3rem' }}>
          Bienvenue sur Diom Locations
        </h1>
        <p style={{ ...styles.subtitle, fontSize: isMobile ? '1rem' : '1.5rem' }}>
          Trouvez votre prochain logement facilement — pour un séjour court ou une location mensuelle.
        </p>

        <div style={styles.buttons}>
          <Link to="/monthly" style={styles.button}>Locations Mensuelles</Link>
          <Link to="/daily" style={styles.button}>Locations Journalières</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url(https://res.cloudinary.com/dgpzat6o4/image/upload/v1745512741/IMG_1108_ardmlj.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '1rem',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: '1rem',
    maxWidth: '800px',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column', // mobile-first
    gap: '1rem',
    alignItems: 'center',
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

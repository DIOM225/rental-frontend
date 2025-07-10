import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  // Listen to screen resize
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // Auto-close mobile menu on click
  const renderLinks = () => (
    <>
      <Link to="/daily" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Residence</Link>
      <Link to="/monthly" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Mensuel</Link>

      {user ? (
        <>
          <Link to="/add" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>+ Ajouter</Link>
          <Link to="/my-listings" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Mes Annonces</Link>
          <Link to="/profile" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Profil</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
          )}
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/loye" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Loye</Link>
          <Link to="/auth" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>
            Connexion / Inscription
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav style={styles.navbar}>
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="Apt Meuble" style={{ height: '80px' }} />
      </Link>

      {isMobile ? (
        <>
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            style={styles.hamburger}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          {isMobileMenuOpen && (
            <div style={styles.mobileMenu}>
              {renderLinks()}
            </div>
          )}
        </>
      ) : (
        <div style={styles.desktopLinks}>
          {renderLinks()}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  logo: {
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#007bff',
  },
  hamburger: {
    fontSize: '1.8rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
  },
  desktopLinks: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: '1rem 2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'flex-start',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    transition: 'background 0.2s ease',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default Navbar;

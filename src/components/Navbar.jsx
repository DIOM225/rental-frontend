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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  const renderLinks = () => (
    <>
      <Link to="/daily" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Residence</Link>
      <Link to="/monthly" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Mensuel</Link>

      {user ? (
        <>
          <Link to="/add" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>+ Ajouter</Link>
          <Link to="/my-listings" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Mes Annonces</Link>
          <Link to="/profile" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Profil</Link>

          {/* 🔹 Loye appears only after login */}
          <Link to="/loye" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>Loye</Link>

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
        <Link to="/auth" style={styles.link} onClick={() => setIsMobileMenuOpen(false)}>
          Connexion / Inscription
        </Link>
      )}
    </>
  );

  return (
    <nav style={styles.navbar}>
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="Apt Meuble" style={{ height: '95px' }} />
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
    padding: '0rem 0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    minHeight: '80px',
    height: '80px'
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
    padding: '0.5rem 1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    alignItems: 'flex-start',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    fontSize: '0.9rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '5px',
    transition: 'background 0.2s ease',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
};

export default Navbar;

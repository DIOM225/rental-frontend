import { Link, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        background: '#222',
        color: '#fff',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2 style={{ color: '#0af' }}>Admin</h2>
        <Link to="/admin/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/admin/users" style={linkStyle}>Users</Link>
        <Link to="/admin/listings" style={linkStyle}>Listings</Link>
        <Link to="/admin/popular" style={linkStyle}>Annonces Populaires</Link> {/* ✅ New link */}
        <Link to="/admin/pending" style={linkStyle}>Pending Listings</Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '0.5rem 0',
};

export default AdminLayout;

import { Link } from 'react-router-dom';

function LoyeNavbar() {
  return (
    <nav style={navStyle}>
      <div style={logo}>Loye 📘</div>
      <ul style={menu}>
        <li><Link to="/loye/dashboard">Dashboard</Link></li>
        <li><Link to="/loye/settings">Paramètres</Link></li>
        <li><Link to="/" onClick={() => {
          localStorage.removeItem('loyeToken');
          localStorage.removeItem('loyeUser');
        }}>Se déconnecter</Link></li>
      </ul>
    </nav>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #ccc',
};

const logo = {
  fontWeight: 'bold',
  fontSize: '1.2rem',
};

const menu = {
  display: 'flex',
  listStyle: 'none',
  gap: '1rem',
};

export default LoyeNavbar;

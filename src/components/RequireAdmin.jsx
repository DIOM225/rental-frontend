import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function RequireAdmin({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setChecking(false);
  }, []);

  if (checking) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default RequireAdmin;

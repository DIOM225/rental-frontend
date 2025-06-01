import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function RequireAuth({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setChecking(false);
  }, []);

  if (checking) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;

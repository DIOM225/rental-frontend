import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

function RequireLoyeRole({ role, children }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRole = async () => {
      const cachedRole = localStorage.getItem('loyeRole');

      if (cachedRole) {
        setUserRole(cachedRole);
        setLoading(false);
        return;
      }

      if (!token) {
        setLoading(false);
        setError('No token');
        return;
      }

      try {
        const res = await axios.get('/api/loye/auth/check-role', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.onboarded) {
          setUserRole(res.data.role);
          localStorage.setItem('loyeRole', res.data.role); // ✅ cache it
        } else {
          setUserRole(null);
        }
      } catch (err) {
        setError('Erreur de vérification du rôle');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [token]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }

  if (error || !userRole) {
    return <Navigate to="/loye/onboarding" replace />;
  }

  if (typeof role === 'string') {
    if (userRole !== role) return <Navigate to="/loye/onboarding" replace />;
  }

  if (Array.isArray(role)) {
    if (!role.includes(userRole)) return <Navigate to="/loye/onboarding" replace />;
  }

  return children;
}

export default RequireLoyeRole;

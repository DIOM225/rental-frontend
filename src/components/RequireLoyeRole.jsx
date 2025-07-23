import { Navigate } from 'react-router-dom';

function RequireLoyeRole({ role, children }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user or no Loye role data
  if (!user || !user.loye || !user.loye.role) {
    return <Navigate to="/loye/onboarding" replace />;
  }

  const userRole = user.loye.role;

  // If one role is accepted (string)
  if (typeof role === 'string') {
    if (userRole !== role) {
      return <Navigate to="/loye/onboarding" replace />;
    }
  }

  // If multiple roles are accepted (array)
  if (Array.isArray(role)) {
    if (!role.includes(userRole)) {
      return <Navigate to="/loye/onboarding" replace />;
    }
  }

  return children;
}

export default RequireLoyeRole;

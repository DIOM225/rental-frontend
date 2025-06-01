import { useEffect, useState } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://rental-backend-uqo8.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      alert('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://rental-backend-uqo8.onrender.com/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Utilisateur supprimé');
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error('❌ Failed to delete user:', err);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Utilisateurs</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role || 'user'}</td>
                <td style={styles.td}>
                  <button style={styles.deleteButton} onClick={() => handleDelete(user._id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  th: {
    borderBottom: '1px solid #ccc',
    padding: '0.5rem',
    textAlign: 'left',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '0.5rem',
  },
  deleteButton: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Users;

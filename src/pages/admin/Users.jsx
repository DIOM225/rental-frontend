import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';


function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Utilisateur supprimé');
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error('❌ Failed to delete user:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      console.log("Fetching profile for ID:", id);

      alert("Erreur de chargement du profil utilisateur");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
              <tr
                key={user._id}
                onClick={() => handleViewProfile(user._id)}
                style={{ cursor: 'pointer', backgroundColor: '#fff' }}
              >
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role || 'user'}</td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user._id);
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Profil de {selectedUser.name}</h3>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</p>
            <p><strong>Rôle:</strong> {selectedUser.role}</p>
            <p><strong>Bio:</strong> {selectedUser.bio || '---'}</p>
            {selectedUser.profilePic && <img src={selectedUser.profilePic} alt="profil" style={styles.avatar} />}
            {selectedUser.idImage && <img src={selectedUser.idImage} alt="ID" style={styles.idImage} />}
            <button onClick={() => setSelectedUser(null)} style={styles.closeBtn}>Fermer</button>
          </div>
        </div>
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
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  idImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: '0.5rem',
    borderRadius: '4px'
  },
  closeBtn: {
    marginTop: '1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Users;

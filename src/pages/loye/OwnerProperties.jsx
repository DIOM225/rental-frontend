// client/src/pages/loye/OwnerProperties.jsx
import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [expandedPropertyId, setExpandedPropertyId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/api/loye/properties');
        setProperties(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des propriétés:', err);
      }
    };

    fetchProperties();
  }, []);

  const toggleExpand = (propertyId) => {
    setExpandedPropertyId(prev => (prev === propertyId ? null : propertyId));
  };

  return (
    <div style={styles.container}>
      <h2>Mes Propriétés</h2>
      {properties.length === 0 ? (
        <p>Aucune propriété trouvée.</p>
      ) : (
        <div style={styles.cardGrid}>
          {properties.map((property) => (
            <div key={property._id} style={styles.card}>
              <div style={styles.cardHeader} onClick={() => toggleExpand(property._id)}>
                <h3>{property.name}</h3>
                <p>{property.address}</p>
                <p><strong>{property.units.length}</strong> unité(s)</p>
              </div>

              {expandedPropertyId === property._id && (
                <div style={styles.renterList}>
                  <h4>Liste des locataires</h4>
                  {property.units.map((unit, index) => (
                    <div key={index} style={styles.renterItem}>
                      <p><strong>Code :</strong> {unit.code}</p>
                      <p><strong>Type :</strong> {unit.type}</p>
                      <p><strong>Loyer :</strong> {unit.rent} FCFA</p>
                      <p><strong>Occupé par :</strong> {unit.occupiedBy ? unit.occupiedBy : 'Non attribué'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '1rem',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fefefe',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  cardHeader: {
    marginBottom: '1rem',
  },
  renterList: {
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #eee',
    marginTop: '1rem',
  },
  renterItem: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #ddd',
  },
};

export default OwnerProperties;

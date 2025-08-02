import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

function PropertyDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/loye/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error('Erreur de chargement:', err);
      }
    };
    fetchDetails();
  }, [id]);

  if (!property) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>⬅ Retour</button>
      <h2>{property.name}</h2>
      <p>{property.address}</p>

      <div style={{ marginTop: '2rem' }}>
        {property.units.map((unit, idx) => (
          <div key={idx} style={{ background: 'white', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{unit.type}</strong> — {unit.code}
              </div>
              <div style={{ fontWeight: 600, color: unit.renter ? '#16a34a' : '#b91c1c' }}>
                {unit.renter ? 'Occupé' : 'Libre'}
              </div>
            </div>

            {unit.renter && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                <p><strong>Locataire:</strong> {unit.renter.name}</p>
                <p><strong>Téléphone:</strong> {unit.renter.phone}</p>
                {unit.renter.profilePic && (
                  <img src={unit.renter.profilePic} alt="Profil" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                )}
                <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                  Statut du loyer: <span style={{ color: '#facc15' }}>À implémenter</span>
                </div>
              </div>
            )}

            {!unit.renter && unit.inviteCode && (
              <div style={{ marginTop: '0.5rem', color: '#334155' }}>
                Code d'invitation: <strong>{unit.inviteCode}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyDetailView;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  FaArrowLeft,
  FaHome,
  FaUsers,
  FaChartLine,
  FaEdit,
} from 'react-icons/fa';
import PropertyUnitCard from './PropertyUnitCard';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  const fetchProperty = useCallback(async () => {
    try {
      const res = await axios.get(`/api/loye/properties/${id}`);
      setProperty(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const stats = useMemo(() => {
    const total = property?.units?.length || 0;
    const occupied = property?.units?.filter((u) => u.renterId || u.renter).length || 0;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, rate };
  }, [property]);

  // ✅ Track changes from unit cards
  const handleChange = (unitId, changes) => {
    console.log('📝 Registered change for:', unitId, changes);
    setPendingChanges((prev) => ({
      ...prev,
      [unitId]: {
        ...(prev[unitId] || {}),
        ...changes,
      },
    }));
  };

  // ✅ Save all pending changes
  const handleSaveAll = async () => {
    console.log('💾 Saving these changes:', pendingChanges);
    setSaving(true);
    try {
      const updates = Object.entries(pendingChanges);

      for (const [unitId, changes] of updates) {
        console.log(`🔧 PATCH /api/loye/units/${unitId}`, changes);
        await axios.patch(`/api/loye/units/${unitId}`, {
          ...(changes.amount !== undefined && { amount: Number(changes.amount) }),
          ...(changes.rentDueDate !== undefined && { rentDueDate: Number(changes.rentDueDate) }),
        });
      }

      await fetchProperty();
      setPendingChanges({});
      setEditMode(false);
      setShowConfirm(false);
    } catch (err) {
      console.error('❌ Save failed:', err);
      alert('Erreur lors de l’enregistrement.');
    }
    setSaving(false);
  };

  if (!property) return <div>Loading...</div>;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ background: '#0b1220', color: '#fff', padding: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <FaArrowLeft /> &nbsp; Retour aux propriétés
        </button>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{property.name}</h1>
            <p style={{ marginTop: 4 }}>{property.address}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: '#fff',
                color: '#0b1220',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              <FaEdit /> &nbsp; {editMode ? 'Quitter' : 'Modifier'}
            </button>
            {editMode && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={Object.keys(pendingChanges).length === 0}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Enregistrer
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <KPI icon={<FaHome />} label="Total unités" value={stats.total} />
          <KPI icon={<FaUsers />} label="Occupées" value={stats.occupied} bg="#dcfce7" color="#065f46" />
          <KPI icon={<FaChartLine />} label="Taux d’occupation" value={`${stats.rate}%`} bg="#ede9fe" color="#5b21b6" />
        </div>

        <h2>Unités de la propriété</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {property.units.map((unit) => (
            <PropertyUnitCard
              key={unit._id}
              unit={unit}
              editable={editMode}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>

      {showConfirm && (
        <div style={overlayStyles.overlay}>
          <div style={overlayStyles.modal}>
            <h3>Confirmer les modifications</h3>
            <p>
              Les changements de loyer ou date d’échéance seront visibles par les locataires.
              Voulez-vous continuer ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={overlayStyles.cancel}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                style={overlayStyles.confirm}
              >
                {saving ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ icon, label, value, bg = '#f1f5f9', color = '#0f172a' }) {
  return (
    <div style={{ background: bg, padding: 16, borderRadius: 12, flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      <div style={{ color, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const overlayStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  cancel: {
    background: '#e5e7eb',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  confirm: {
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
};

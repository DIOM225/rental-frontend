// 📄 src/pages/loye/PropertyUnitCard.jsx
import React, { useState, useEffect } from 'react';
import { FaPhone, FaCheckCircle, FaMinusCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from '../../utils/axiosInstance';

function formatFCFA(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function avatarInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] + (parts[1]?.[0] || '')).toUpperCase();
}

function PropertyUnitCard({ unit, editable = false, onChange = () => {}, onUnitUpdate = () => {} }) {
  const [rent, setRent] = useState(unit.rent ?? '');
  const [dueDate, setDueDate] = useState(unit.rentDueDate ?? 10);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', birthday: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Sync local state if props change
  useEffect(() => {
    setRent(unit.rent ?? '');
    setDueDate(unit.rentDueDate ?? 10);
  }, [unit.rent, unit.rentDueDate]);

  // ✅ Notify parent on rent change
  const handleRentChange = (e) => {
    const val = e.target.value;
    setRent(val);
    const num = Number(val);
    if (!isNaN(num)) {
      onChange(unit._id, { rent: num });
    }
  };

  // ✅ Notify parent on dueDate change
  const handleDueDateChange = (e) => {
    const val = Number(e.target.value);
    setDueDate(val);
    onChange(unit._id, { rentDueDate: val });
  };

  const isOccupied = !!unit.renterId || !!unit.renter;

  // ✅ Handle account creation
  const handleCreateAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Vous devez être connecté.');
        return;
      }

      const res = await axios.post(
        `/api/loye/units/${unit._id}/create-renter`,
        {
          name: form.name,
          phone: form.phone,
          birthday: form.birthday,
          password: form.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Renter created:', res.data);

      // 👉 Update parent state directly
      onUnitUpdate(unit._id, { renter: res.data.renter, renterId: res.data.renter._id });

      // Reset modal state
      setShowModal(false);
      setForm({ name: '', phone: '', birthday: '', password: '' });
      setShowPassword(false);

      alert('✅ Compte locataire créé et lié avec succès.');
    } catch (err) {
      console.error('❌ Erreur lors de la création du compte:', err);
      alert(err.response?.data?.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <div style={styles.unitCard}>
      <div style={styles.unitTopRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.unitType}>{(unit.type || '').toLowerCase()}</span>
            <span style={styles.codeText}>Code: {unit.code}</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.fcfaSymbol}>$</span>
            {editable ? (
              <input
                type="number"
                value={rent}
                onChange={handleRentChange}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: '4px 8px',
                  width: 100,
                }}
              />
            ) : (
              <span style={styles.rentValue}>{formatFCFA(rent)} FCFA</span>
            )}
            <span style={{ color: '#94a3b8', fontSize: 14 }}>/ mois</span>
          </div>
          {editable && (
            <div style={{ marginTop: 10 }}>
              <label style={{ marginRight: 8 }}>Échéance :</label>
              <select
                value={dueDate}
                onChange={handleDueDateChange}
                style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isOccupied ? (
          unit.latestPayment ? (
            <span style={styles.badgePaid}>
              <FaCheckCircle /> Payé
            </span>
          ) : (
            <span style={styles.badgeOccupied}>
              <FaCheckCircle /> Occupé
            </span>
          )
        ) : (
          <span style={styles.badgeVacant}>
            <FaMinusCircle /> Libre
          </span>
        )}
      </div>

      <div style={styles.divider} />

      {isOccupied ? (
        <div style={styles.tenantWrap}>
          {unit.renter?.profilePic ? (
            <img
              src={unit.renter.profilePic}
              alt="Profil"
              style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
            />
          ) : (
            <div style={styles.avatarCircle}>{avatarInitials(unit.renter?.name)}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 16 }}>{unit.renter?.name || '—'}</strong>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <FaPhone /> {unit.renter?.phone || '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noTenantRow}>
          <span>Aucun compte locataire</span>
          <button style={styles.createBtn} onClick={() => setShowModal(true)}>
            Créer locataire
          </button>
        </div>
      )}

      <div style={styles.footerNote}>
        <span style={{ color: '#94a3b8' }}>•</span>&nbsp;Statut du loyer:&nbsp;
        {unit.latestPayment ? (
          <span style={{ color: '#15803d', fontWeight: 700 }}>
            Loyer payé le&nbsp;
            {new Date(unit.latestPayment.date).toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>En attente</span>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>Créer un compte locataire</h3>

            <input
              type="text"
              placeholder="Nom complet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={modalStyles.input}
            />

            <input
              type="tel"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={modalStyles.input}
            />

            <input
              type="date"
              placeholder="Date de naissance"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              style={modalStyles.input}
            />

            {/* Password with show/hide eye button */}
            <div style={modalStyles.passwordRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ ...modalStyles.input, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Voir le mot de passe'}
                style={modalStyles.eyeBtn}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button style={modalStyles.cancel} onClick={() => { setShowModal(false); setShowPassword(false); }}>
                Annuler
              </button>
              <button style={modalStyles.confirm} onClick={handleCreateAccount}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  unitCard: {
    background: '#fff',
    border: '1px solid #e5eaf1',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
  },
  unitTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  unitType: {
    textTransform: 'capitalize',
    fontWeight: 800,
    fontSize: 18,
    color: '#0f172a',
  },
  codeText: { color: '#64748b', fontWeight: 600, fontSize: 14 },
  fcfaSymbol: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 22,
    height: 22,
    borderRadius: 6,
    background: '#dcfce7',
    color: '#16a34a',
    fontWeight: 900,
    fontSize: 12,
  },
  rentValue: { fontWeight: 900, fontSize: 18, color: '#0f172a' },
  badgeOccupied: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
  },
  badgeVacant: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
  },
  badgePaid: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
  },
  divider: { height: 1, background: '#eef2f7', margin: '14px 0' },
  tenantWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#e2e8f0',
    color: '#0f172a',
    fontWeight: 800,
    display: 'grid',
    placeItems: 'center',
  },
  noTenantRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#334155',
    fontSize: 15,
    fontWeight: 500,
  },
  createBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
  },
  footerNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px dashed #e5e7eb',
    color: '#334155',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
  },
};

const modalStyles = {
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
    maxWidth: 420,
    width: '94%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  },
  passwordRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    fontSize: 16,
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

export default PropertyUnitCard;

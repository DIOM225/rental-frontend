// 📄 src/pages/loye/PropertyUnitCard.jsx
import React, { useState, useEffect } from 'react';
import { FaPhone, FaCheckCircle, FaMinusCircle } from 'react-icons/fa';

function formatFCFA(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function avatarInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] + (parts[1]?.[0] || '')).toUpperCase();
}

function PropertyUnitCard({ unit, editable = false, onChange = () => {} }) {
  const [rent, setRent] = useState(unit.rent ?? '');
  const [dueDate, setDueDate] = useState(unit.rentDueDate ?? 10);

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
        <div style={{ color: '#334155' }}>
          {unit.inviteCode ? (
            <>
              Code d'invitation: <strong>{unit.inviteCode}</strong>
            </>
          ) : (
            <>Aucun code d'invitation pour l’instant</>
          )}
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

export default PropertyUnitCard;

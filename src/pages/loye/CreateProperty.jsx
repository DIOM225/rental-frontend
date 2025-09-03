// client/src/pages/loye/CreateProperty.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

// ---------- Child component moved OUTSIDE so it doesn't remount each render ----------
function UnitCard({ label, typeKey, units, onUnitChange, styles }) {
  const idPrefix = typeKey.replace(/[^a-z0-9]/gi, '');
  const isDigits = (val) => val === '' || /^\d+$/.test(val);

  return (
    <div style={styles.unitCard}>
      <div style={styles.unitHeader}>
        <span style={styles.unitDot} />
        <h4 style={styles.unitTitle}>{label}</h4>
      </div>

      {/* Exactly two columns on desktop, auto-wrap to one on small screens */}
      <div style={styles.unitGrid}>
        <div style={styles.field}>
          <label htmlFor={`${idPrefix}-count`} style={styles.label}>
            Nombre d&apos;unités
          </label>
          <input
            id={`${idPrefix}-count`}
            type="text"
            value={units[typeKey].count}
            autoComplete="off"
            onChange={(e) => {
              const v = e.target.value;
              if (isDigits(v)) onUnitChange(typeKey, 'count', v);
            }}
            style={styles.input}
            placeholder="0"
          />
        </div>

        <div style={styles.field}>
          <label htmlFor={`${idPrefix}-rent`} style={styles.label}>
            Loyer par unité (FCFA)
          </label>
          <div style={styles.inputPrefixWrap}>
            <span style={styles.prefix}>₣</span>
            <input
              id={`${idPrefix}-rent`}
              type="text"
              value={units[typeKey].rent}
              autoComplete="off"
              onChange={(e) => {
                const v = e.target.value;
                if (isDigits(v)) onUnitChange(typeKey, 'rent', v);
              }}
              style={{ ...styles.input, ...styles.inputWithPrefix }}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProperty() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [units, setUnits] = useState({
    studio: { count: '', rent: '' },
    '2br': { count: '', rent: '' },
    '3br': { count: '', rent: '' },
  });
  const [message, setMessage] = useState('');
  const [inviteCodes, setInviteCodes] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleUnitChange = (type, field, value) => {
    setUnits((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const hasAtLeastOneValidUnit = Object.values(units).some(
    ({ count, rent }) => Number(count) > 0 && Number(rent) > 0
  );

  const canSubmit =
    name.trim() && address.trim() && hasAtLeastOneValidUnit && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setMessage('');
    setError('');
    setInviteCodes(null);
    setSubmitting(true);

    try {
      const payload = { name: name.trim(), address: address.trim(), unitsByType: {} };

      for (const type of Object.keys(units)) {
        const count = parseInt(units[type].count || '0', 10);
        const rent = parseInt(units[type].rent || '0', 10);

        if (Number.isFinite(count) && Number.isFinite(rent) && count > 0 && rent > 0) {
          payload.unitsByType[type] = { count, rent };
        }
      }

      const res = await axios.post('/api/loye/properties', payload);
      setMessage(res.data?.message || 'Propriété créée.');
      if (res.data?.inviteCodes) setInviteCodes(res.data.inviteCodes);

      setTimeout(() => navigate('/loye/properties'), 1600);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page title */}
        <div style={styles.pageHeader}>
          <h1 style={styles.title}>Créer une Propriété</h1>
          <p style={styles.subtitle}>
            Ajoutez une nouvelle propriété avec ses unités au système
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={styles.card}>
          {/* Card header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}>🏡</div>
            <h2 style={styles.cardTitle}>Informations de la propriété</h2>
          </div>

          {/* Property info: 2 cols on desktop, 1 on small screens */}
          <div style={styles.gridAutoFit}>
            <div style={styles.field}>
              <label htmlFor="prop-name" style={styles.label}>
                Nom de la propriété <span style={styles.req}>*</span>
              </label>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.prefix}>🏠</span>
                <input
                  id="prop-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ ...styles.input, ...styles.inputWithPrefix }}
                  placeholder="Nom de la propriété"
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label htmlFor="prop-address" style={styles.label}>
                Adresse <span style={styles.req}>*</span>
              </label>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.prefix}>📍</span>
                <input
                  id="prop-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ ...styles.input, ...styles.inputWithPrefix }}
                  placeholder="Adresse"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div style={styles.sectionDivider} />

          {/* Section header */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Types d&apos;unités</h3>
            <p style={styles.sectionHint}>
              Ajoutez au moins un type d&apos;unité avec un nombre et un loyer
            </p>
          </div>

          {/* Unit types */}
          <UnitCard
            label="STUDIO"
            typeKey="studio"
            units={units}
            onUnitChange={handleUnitChange}
            styles={styles}
          />
          <UnitCard
            label="2BR"
            typeKey="2br"
            units={units}
            onUnitChange={handleUnitChange}
            styles={styles}
          />
          <UnitCard
            label="3BR"
            typeKey="3br"
            units={units}
            onUnitChange={handleUnitChange}
            styles={styles}
          />

          {/* Footer */}
          <div style={styles.formFooter}>
            <button
              type="submit"
              style={{ ...styles.submitBtn, ...(canSubmit ? {} : styles.submitBtnDisabled) }}
              disabled={!canSubmit}
            >
              {submitting ? 'Création…' : 'Créer'}
            </button>

            {message ? <p style={styles.success}>{message}</p> : null}
            {error ? <p style={styles.error}>{error}</p> : null}

            {inviteCodes && (
              <div style={styles.inviteBox}>
                {inviteCodes.ownerInviteCode && (
                  <p>
                    <strong>Code d’invitation du propriétaire :</strong>{' '}
                    {inviteCodes.ownerInviteCode}
                  </p>
                )}
                {inviteCodes.managerInviteCode && (
                  <p>
                    <strong>Code d’invitation du gestionnaire :</strong>{' '}
                    {inviteCodes.managerInviteCode}
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  // Page
  page: {
    background: 'linear-gradient(180deg, #f6f8fb 0%, #f1f5f9 100%)',
    minHeight: '100vh',
    padding: '2rem 1rem',
    boxSizing: 'border-box',
  },
  container: { maxWidth: 980, margin: '0 auto' },

  // Header
  pageHeader: { textAlign: 'center', marginBottom: '1.25rem' },
  title: {
    margin: 0,
    fontSize: '2.25rem',
    fontWeight: 800,
    letterSpacing: 0.3,
    background: 'linear-gradient(90deg,#10b981 0%,#3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  subtitle: { color: '#64748b', marginTop: 6 },

  // Card
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '1.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'linear-gradient(90deg,#f0f9ff,#f8fafc)',
    borderRadius: 12,
    padding: '0.9rem 1rem',
    marginBottom: '1rem',
  },
  headerIcon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: '#e0f2fe',
  },
  cardTitle: { margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' },

  // Property grid: 2 columns on desktop, 1 on small screens via auto-fit
  gridAutoFit: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    marginTop: '0.75rem',
  },

  // Fields / inputs
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: '#334155' },
  req: { color: '#ef4444' },

  input: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0 12px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputPrefixWrap: { position: 'relative', width: '100%', boxSizing: 'border-box' },
  prefix: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.7,
    fontSize: 14,
    pointerEvents: 'none',
  },
  inputWithPrefix: { paddingLeft: 36 },

  // Divider + section header
  sectionDivider: { height: 1, background: '#f1f5f9', margin: '1.25rem 0' },
  sectionHeader: { textAlign: 'center', marginBottom: '0.75rem' },
  sectionTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' },
  sectionHint: { margin: 0, color: '#64748b', fontSize: 14 },

  // Unit card + grid
  unitCard: {
    border: '1px solid #eef2f7',
    background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
    borderRadius: 14,
    padding: '1rem',
    marginTop: '0.8rem',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  unitHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  unitDot: { width: 14, height: 14, borderRadius: 4, background: '#3b82f6', opacity: 0.9 },
  unitTitle: { margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: 0.6, color: '#0f172a' },

  // Two columns on wide screens; collapses to one with auto-fit
  unitGrid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    marginTop: 10,
  },

  // Footer
  formFooter: { marginTop: '1.25rem', display: 'grid', gap: 10 },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 800,
    color: '#fff',
    cursor: 'pointer',
    background: 'linear-gradient(90deg,#2563eb 0%, #3b82f6 100%)',
    boxShadow: '0 8px 20px rgba(59,130,246,0.25)',
  },
  submitBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  success: { color: '#16a34a', fontWeight: 700 },
  error: { color: '#dc2626', fontWeight: 700 },

  inviteBox: {
    marginTop: '0.5rem',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    color: '#075985',
    borderRadius: 10,
    padding: '0.8rem',
  },
};

export default CreateProperty;

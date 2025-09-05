import { useEffect, useState, useMemo } from 'react';
import axios from '../../utils/axiosInstance';
import PayRentButton from '../../components/PayRentButton';

import {
  FaCalendarAlt, FaClock, FaHome, FaMoneyBillWave,
  FaMapMarkerAlt, FaMobileAlt
} from 'react-icons/fa';

// --- French month parsing for strings like "1 Août 2025" ---
const FR_MONTHS = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12
};

function guessPeriodFromDueDate(dueDateStr) {
  if (!dueDateStr || typeof dueDateStr !== 'string') {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const m = dueDateStr.trim().toLowerCase().match(/(\d{1,2})\s+([a-zéûôîàèç]+)\s+(\d{4})/i);
  if (!m) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const monthName = m[2].normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents
  const month = FR_MONTHS[monthName] || FR_MONTHS[m[2]];
  const year = parseInt(m[3], 10);
  if (!month || !year) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year, month };
}

function LoyeDashboard() {
  const [unitData, setUnitData] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const mockData = {
    name: 'Madou',
    unit: 'Unit 101',
    rentAmount: 2000,
    dueDate: '1 Août 2025',
    daysRemaining: 2,
    leaseEnd: '30 Décembre 2024',
    unitType: '2 Pièces',
    email: 'diomande.madou22@gmail.com',
    phone: '0700000000',
    mgmtEmail: 'gestion@loye.com',
    mgmtPhone: '+2250707070707',
    hours: 'Lun–Ven: 9h–18h',
    unitCode: 'S-5000-ID6M'
  };

  // ------- helpers -------
  const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');
  const red = { color: '#dc2626', fontWeight: 600 }; // red-600

  const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const normalizeApi = (raw) => {
    const out = {
      name: raw?.name || raw?.renterName || raw?.user?.name,
      unit: raw?.unit || raw?.unitLabel || raw?.unitName,
      unitCode: raw?.unitCode || raw?.unit?.code,
      rentAmount: typeof raw?.rentAmount === 'number'
        ? raw.rentAmount
        : (typeof raw?.rent === 'number' ? raw.rent : undefined),
      dueDate: raw?.dueDate ? fmtDate(raw.dueDate) : (raw?.nextDueDate ? fmtDate(raw.nextDueDate) : raw?.dueDateText),
      daysRemaining: typeof raw?.daysRemaining === 'number'
        ? raw.daysRemaining
        : (() => {
            if (raw?.dueDate || raw?.nextDueDate) {
              const due = new Date(raw.dueDate || raw.nextDueDate);
              const today = new Date();
              return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            }
            return undefined;
          })(),
      leaseEnd: raw?.leaseEnd ? fmtDate(raw.leaseEnd) : raw?.leaseEndText,
      unitType: raw?.unitType || raw?.type || raw?.unit?.type,
      email: raw?.email || raw?.renter?.email || raw?.user?.email,
      phone: raw?.phone || raw?.renter?.phone || raw?.user?.phone,
      mgmtEmail: raw?.mgmtEmail || raw?.manager?.email,
      mgmtPhone: raw?.mgmtPhone || raw?.manager?.phone,
      hours: raw?.hours || raw?.manager?.hours || raw?.officeHours
    };
    return out;
  };

  // field renderer with red fallback (NO state updates here)
  const field = (val, labelForFallback) =>
    (isBlank(val) && !Number.isFinite(val))
      ? <span style={red}>(à relier à la DB: {labelForFallback})</span>
      : <>{val}</>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setUsingMock(false);
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/loye/renter/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res?.data && typeof res.data === 'object') {
          const normalized = normalizeApi(res.data);
          const hasCore =
            !isBlank(normalized.name) ||
            !isBlank(normalized.unit) ||
            Number.isFinite(normalized.rentAmount);

          if (hasCore) {
            setUnitData(normalized);
            return;
          }
        }

        // API incomplete → mock
        setUsingMock(true);
        setUnitData(mockData);
      } catch (err) {
        // API failed → mock
        setUsingMock(true);
        setUnitData(mockData);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Read unit code from localStorage once (set by AuthPage after login)
  const storedUnitCode = useMemo(() => {
    try {
      return localStorage.getItem('loye.unitCode') || null;
    } catch {
      return null;
    }
  }, []);

  // compute if any field is missing (pure derived value)
  const missingAny = useMemo(() => {
    if (!unitData) return false;
    const candidates = [
      unitData.name, unitData.unit, unitData.rentAmount,
      unitData.dueDate, unitData.daysRemaining, unitData.leaseEnd,
      unitData.unitType, unitData.email, unitData.phone,
      unitData.mgmtEmail, unitData.mgmtPhone, unitData.hours
    ];
    return candidates.some(v => (isBlank(v) && !Number.isFinite(v)));
  }, [unitData]);

  const isRentDue = useMemo(() => {
    if (!unitData) return false;
    const dr = unitData.daysRemaining;
    return Number.isFinite(dr) ? dr <= 3 : false;
  }, [unitData]);

  if (!unitData) return null;

  // ✅ Safe unit code used for payments (priority: stored → API → label)
  const safeUnitCode = storedUnitCode || unitData?.unitCode || null;

  return (
    <div style={styles.container}>
      {(usingMock || missingAny) && (
        <div style={styles.alert}>
          {usingMock && (
            <div style={{ ...styles.badge, background: '#fee2e2', color: '#991b1b' }}>
              ⚠️ Données fictives (mock) — connectez l’API pour afficher les vraies données
            </div>
          )}
          {missingAny && (
            <div style={{ ...styles.badge, background: '#fee2e2', color: '#991b1b' }}>
              ⚠️ Champs manquants — les valeurs en <strong style={{ color: '#dc2626' }}>rouge</strong> doivent être reliées à la base de données
            </div>
          )}
        </div>
      )}

      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Bienvenue, {field(unitData.name, 'name')}</h2>
        <p style={styles.unit}>
          <FaMapMarkerAlt style={styles.iconInline} /> - {field(unitData.unit, 'unit')}
          {safeUnitCode && (
            <span style={{ marginLeft: 8, color: '#64748b', fontWeight: 600 }}>
              | Code: {safeUnitCode}
            </span>
          )}
        </p>
      </div>

      {isRentDue && (
        <div style={styles.banner}>
          <div>
            <p style={styles.bannerTitle}>🕒 Statut du loyer</p>
            <p style={styles.bannerText}>
              Paiement dans {field(unitData.daysRemaining, 'daysRemaining')} jours
            </p>
            <p style={styles.bannerText}>
              Montant:&nbsp;
              <strong>
                {field(
                  Number.isFinite(unitData.rentAmount) ? `${unitData.rentAmount} FCFA` : '',
                  'rentAmount'
                )}
              </strong>{' '}
              dû le {field(unitData.dueDate, 'dueDate')}
            </p>
          </div>
          <div style={styles.bannerButtons}>
            <span style={styles.waveReady}>
              <FaMobileAlt /> <span style={styles.waveText}>Wave prêt</span>
            </span>

            {/* ✅ Use the stored unit code for payment. Disable if missing. */}
            <PayRentButton
              unitCode={safeUnitCode || undefined}
              period={guessPeriodFromDueDate(unitData?.dueDate)}
              label="Payer le loyer"
              disabled={!safeUnitCode || !Number.isFinite(unitData?.rentAmount)}
              onAccepted={(resp) => console.log('ACCEPTED', resp)}
              onRefused={(resp) => console.log('REFUSED', resp)}
              onClosed={() => console.log('Checkout closed')}
            />
          </div>

          {!safeUnitCode && (
            <div style={{ marginTop: 8, color: '#dc2626', fontWeight: 600 }}>
              Le code du logement est manquant — impossible d’initier le paiement.
            </div>
          )}
        </div>
      )}

      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Loyer mensuel</p>
            <h3 style={styles.metricValue}>
              {field(
                Number.isFinite(unitData.rentAmount) ? `${unitData.rentAmount} FCFA` : '',
                'rentAmount'
              )}
            </h3>
          </div>
          <FaMoneyBillWave size={24} color="#10B981" />
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Prochaine échéance</p>
            <h3 style={styles.metricValue}>
              {field(unitData.dueDate?.split?.(',')[0] || unitData.dueDate, 'dueDate')}
            </h3>
          </div>
          <FaCalendarAlt size={22} color="#3B82F6" />
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Fin du bail</p>
            <h3 style={styles.metricValue}>{field(unitData.leaseEnd, 'leaseEnd')}</h3>
          </div>
          <FaClock size={22} color="#8B5CF6" />
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLeft}>
            <p style={styles.metricLabel}>Type</p>
            <h3 style={styles.metricValue}>{field(unitData.unitType, 'unitType')}</h3>
          </div>
          <FaHome size={22} color="#F97316" />
        </div>
      </div>

      <div style={styles.tabsRow}>
        <button style={styles.tabBtn}>Historique</button>
        <button style={styles.tabBtn}>Détails</button>
        <button style={{ ...styles.tabBtn, ...styles.activeTab }}>Contact</button>
      </div>

      <div style={styles.contactCard}>
        <h3 style={styles.contactTitle}>📞 Informations de contact</h3>
        <p style={styles.infoNote}>ℹ️ Pour les urgences ou demandes, contactez la gestion.</p>
        <div style={styles.infoRow}>
          <div>
            <h4 style={styles.infoHeader}>Vos infos</h4>
            <p>
              📧 Email: {field(unitData.email, 'email')}
              <br />
              📞 Téléphone: {field(unitData.phone, 'phone')}
            </p>
          </div>
          <div>
            <h4 style={styles.infoHeader}>Gestionnaire</h4>
            <p>
              📧 Email: {field(unitData.mgmtEmail, 'mgmtEmail')}
              <br />
              📞 Téléphone: {field(unitData.mgmtPhone, 'mgmtPhone')}
              <br />
              ⏰ Heures: {field(unitData.hours, 'hours')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f8fafc', padding: '2rem', minHeight: '100vh' },
  alert: { marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: { padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: 14, fontWeight: 700 },

  headerRow: { display: 'flex', flexDirection: 'column', marginBottom: '1rem' },
  heading: { fontSize: '2rem', fontWeight: 700, marginBottom: '0.2rem' },
  unit: { display: 'flex', alignItems: 'center', color: '#475569' },
  iconInline: { marginRight: 4 },

  banner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  bannerTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: 4 },
  bannerText: { margin: 0, fontSize: '0.95rem', color: '#334155' },
  bannerButtons: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  waveReady: {
    backgroundColor: '#e0edff',
    padding: '0.3rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  waveText: { color: '#2563eb', fontWeight: 600 },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLeft: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  metricLabel: { fontSize: '0.9rem', fontWeight: 600, color: '#64748b' },
  metricValue: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' },

  tabsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  tabBtn: {
    flex: 1,
    padding: '0.8rem',
    border: 'none',
    background: 'transparent',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#475569'
  },
  activeTab: { backgroundColor: 'white', color: '#0f172a' },

  contactCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  contactTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' },
  infoNote: { fontSize: '0.95rem', marginBottom: '1rem', color: '#555' },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  infoHeader: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' },
};

export default LoyeDashboard;

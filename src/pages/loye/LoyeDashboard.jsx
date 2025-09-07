// 📄 client/src/pages/loye/LoyeDashboard.jsx
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
  const monthName = m[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const month = FR_MONTHS[monthName] || FR_MONTHS[m[2]];
  const year = parseInt(m[3], 10);
  if (!month || !year) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year, month };
}

// ---------- helpers (no hooks) ----------
const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatFCFA = (n) => {
  if (!Number.isFinite(n)) return '';
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
};

const capitalizeWords = (s) =>
  typeof s === 'string' ? s.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : s;

function normalizeApi(raw) {
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
    hours: raw?.hours || raw?.manager?.hours || raw?.officeHours,
    propertyName: raw?.propertyName,
    propertyAddress: raw?.propertyAddress
  };
  return out;
}

function LoyeDashboard() {
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'details' | 'contact'
  const [history, setHistory] = useState([]); // simple list of payments
  const [historyLoading, setHistoryLoading] = useState(false);

  const red = { color: '#dc2626', fontWeight: 600 };

  // load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/loye/renter/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const normalized = normalizeApi(res?.data || {});
        try {
          const localUser = JSON.parse(localStorage.getItem('user'));
          if (!normalized.name && localUser?.name) normalized.name = localUser.name;
        } catch {}
        if (!normalized.unit && res?.data?.propertyName && (res?.data?.unitCode || res?.data?.unit?.code)) {
          normalized.unit = res.data.propertyName;
        }

        setUnitData(normalized);
      } catch (e) {
        console.error('Dashboard load failed:', e);
        setUnitData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // fetch renter payment history
  const fetchHistory = async (unitCode) => {
    if (!unitCode) return;
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/loye/renter/payments`, {
        params: { unitCode },
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(Array.isArray(data?.payments) ? data.payments : []);
    } catch (e) {
      console.warn('No payments API yet or failed to load history.', e?.message || e);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // inject responsive CSS + skeleton keyframes once
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('loye-dashboard-styles')) return;

    const css = `
@keyframes skel { 0%{background-position:100% 0} 100%{background-position:0 0} }

/* Mobile tweaks */
@media (max-width: 640px) {
  .loye-container { padding: 1rem !important; }
  .loye-heading { font-size: 1.5rem !important; }
  .loye-header-sub { gap: 6px !important; }
  .loye-chip { font-size: 11px !important; padding: 2px 8px !important; }

  .loye-banner { padding: 0.75rem !important; }
  .loye-banner-inner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
  .loye-banner-buttons { width: 100% !important; gap: 8px !important; }
  .loye-banner-buttons > * { flex: 1 1 auto !important; }

  .loye-metrics { grid-template-columns: 1fr !important; }
  .loye-metric-value { font-size: 1.2rem !important; }

  .loye-tabs { overflow-x: auto; white-space: nowrap; }
  .loye-tab { min-width: 140px; }

  .loye-card { padding: 1rem !important; }
  .loye-detail-row { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
}

/* Very small screens */
@media (max-width: 380px) {
  .loye-tab { min-width: 120px; }
}
`;
    const style = document.createElement('style');
    style.id = 'loye-dashboard-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // read stored unit code ONCE
  const storedUnitCode = useMemo(() => {
    try {
      return localStorage.getItem('loye.unitCode') || null;
    } catch {
      return null;
    }
  }, []);

  // derive a 10-digit CI phone for CinetPay hint (+225 stripped)
  const renterPhone10 = useMemo(() => {
    const raw = unitData?.phone || '';
    const digits = String(raw).replace(/\D/g, '');
    // remove leading country code if present
    const trimmed = digits.replace(/^(225|00225)/, '');
    return /^\d{10}$/.test(trimmed) ? trimmed : null;
  }, [unitData?.phone]);

  // kick off history fetch when we know the code
  useEffect(() => {
    const code = storedUnitCode || unitData?.unitCode || null;
    fetchHistory(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUnitCode, unitData?.unitCode]);

  if (loading) {
    return (
      <div className="loye-container" style={styles.container}>
        <div style={{ ...styles.skel, width: 220, height: 26 }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div style={{ ...styles.skel, width: 160, height: 12 }} />
          <div style={{ ...styles.skel, width: 110, height: 12 }} />
        </div>
        <div style={{ ...styles.skel, height: 90, marginTop: 20 }} />
        <div className="loye-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <div style={{ ...styles.skel, height: 90 }} />
          <div style={{ ...styles.skel, height: 90 }} />
          <div style={{ ...styles.skel, height: 90 }} />
          <div style={{ ...styles.skel, height: 90 }} />
        </div>
      </div>
    );
  }

  if (!unitData) return null;

  const safeUnitCode = storedUnitCode || unitData?.unitCode || null;
  const unitLabel = unitData?.unit || '';

  // avoid repeating the code chip if already present next to the address/label
  const showUnitChip = Boolean(safeUnitCode && !(unitLabel || '').includes(safeUnitCode));

  const dr = Number.isFinite(unitData?.daysRemaining) ? unitData.daysRemaining : null;
  const bannerVariant = dr == null
    ? 'neutral'
    : (dr > 3 ? 'success' : (dr >= 0 ? 'warning' : 'danger'));

  const bannerStyle = {
    ...styles.banner,
    ...(bannerVariant === 'success' ? styles.bannerSuccess
      : bannerVariant === 'warning' ? styles.bannerWarning
      : bannerVariant === 'danger' ? styles.bannerDanger
      : {}),
  };

  const statusColor = bannerVariant === 'success'
    ? '#065f46'
    : bannerVariant === 'warning'
    ? '#92400e'
    : bannerVariant === 'danger'
    ? '#991b1b'
    : '#334155';

  let statusLine = 'Statut du loyer';
  if (dr != null) {
    if (dr > 1) statusLine = `Paiement dans ${dr} jours`;
    else if (dr === 1) statusLine = 'Paiement dans 1 jour';
    else if (dr === 0) statusLine = 'Paiement aujourd’hui';
    else statusLine = `En retard de ${Math.abs(dr)} jours`;
  }

  const payDisabled = !safeUnitCode || !Number.isFinite(unitData?.rentAmount);

  const field = (val, labelForFallback) =>
    (isBlank(val) && !Number.isFinite(val))
      ? <span style={red}>(à relier à la DB: {labelForFallback})</span>
      : <>{val}</>;

  // when checkout closes or resolves, refresh history
  const handleAccepted = (resp) => {
    console.log('ACCEPTED', resp);
    fetchHistory(safeUnitCode);
    alert('Paiement accepté ✅');
  };
  const handleRefused = (resp) => {
    console.log('REFUSED', resp);
    alert('Paiement refusé ❌');
  };
  const handleClosed = () => {
    console.log('Checkout closed');
    fetchHistory(safeUnitCode);
  };

  return (
    <div className="loye-container" style={styles.container}>
      {/* Header */}
      <div className="loye-header" style={styles.headerRow}>
        <h2 className="loye-heading" style={styles.heading}>Bienvenue, {capitalizeWords(field(unitData.name, 'name'))}</h2>

        <div className="loye-header-sub" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', color: '#475569' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <FaMapMarkerAlt style={styles.iconInline} />
            {field(unitLabel, 'unit')}
          </span>

          {showUnitChip && (
            <span className="loye-chip" style={styles.chip}>Code: {safeUnitCode}</span>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="loye-banner" style={bannerStyle}>
        <div className="loye-banner-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16 }}>
          <div>
            <p style={{ ...styles.bannerTitle, color: statusColor }}>🕒 {statusLine}</p>
            <p style={styles.bannerText}>
              Prochain paiement de{' '}
              <strong>
                {field(
                  Number.isFinite(unitData.rentAmount) ? formatFCFA(unitData.rentAmount) : '',
                  'rentAmount'
                )}
              </strong>{' '}
              {unitData.dueDate && <>dû le {field(unitData.dueDate, 'dueDate')}</>}
            </p>
            {unitData.propertyAddress && (
              <p style={{ ...styles.bannerText, marginTop: 4 }}>
                📍 {unitData.propertyAddress}
              </p>
            )}
          </div>

          <div className="loye-banner-buttons" style={styles.bannerButtons}>
            <span style={styles.waveReady}>
              <FaMobileAlt /> <span style={styles.waveText}>Wave prêt</span>
            </span>
            <PayRentButton
              unitCode={safeUnitCode || undefined}
              period={guessPeriodFromDueDate(unitData?.dueDate)}
              amountXof={unitData?.rentAmount}
              label="Payer le loyer"
              disabled={payDisabled}
              // Hints to route directly to Wave/Orange CI
              channels="WALLET"
              renterCountry="CI"
              renterPhone10={renterPhone10 || undefined}
              onAccepted={handleAccepted}
              onRefused={handleRefused}
              onClosed={handleClosed}
            />
          </div>
        </div>

        {!safeUnitCode && (
          <div style={{ marginTop: 8, color: '#dc2626', fontWeight: 600 }}>
            Le code du logement est manquant — impossible d’initier le paiement.
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="loye-metrics" style={styles.metricsRow}>
        <MetricCard
          label="Loyer mensuel"
          value={field(Number.isFinite(unitData.rentAmount) ? formatFCFA(unitData.rentAmount) : '', 'rentAmount')}
          icon={<FaMoneyBillWave size={18} color="#065f46" />}
          dot="#10B981"
        />
        <MetricCard
          label="Prochaine échéance"
          value={field(unitData.dueDate?.split?.(',')[0] || unitData.dueDate, 'dueDate')}
          icon={<FaCalendarAlt size={18} color="#1d4ed8" />}
          dot="#3B82F6"
        />
        <MetricCard
          label="Fin du bail"
          value={field(unitData.leaseEnd, 'leaseEnd')}
          icon={<FaClock size={18} color="#6d28d9" />}
          dot="#8B5CF6"
        />
        <MetricCard
          label="Type"
          value={field(unitData.unitType, 'unitType')}
          icon={<FaHome size={18} color="#c2410c" />}
          dot="#F97316"
        />
      </div>

      {/* TABS */}
      <div className="loye-tabs" style={styles.tabsRow}>
        <button
          className="loye-tab"
          onClick={() => setActiveTab('history')}
          style={{ ...styles.tabBtn, ...(activeTab === 'history' ? styles.activeTab : {}) }}
        >
          Historique
        </button>
        <button
          className="loye-tab"
          onClick={() => setActiveTab('details')}
          style={{ ...styles.tabBtn, ...(activeTab === 'details' ? styles.activeTab : {}) }}
        >
          Détails
        </button>
        <button
          className="loye-tab"
          onClick={() => setActiveTab('contact')}
          style={{ ...styles.tabBtn, ...(activeTab === 'contact' ? styles.activeTab : {}) }}
        >
          Contact
        </button>
      </div>

      {/* TAB PANELS */}
      {activeTab === 'history' && (
        <div className="loye-card" style={styles.card}>
          <h3 style={styles.cardTitle}>🧾 Historique des paiements</h3>

          {historyLoading ? (
            <div style={{ ...styles.skel, height: 60 }} />
          ) : history.length === 0 ? (
            <EmptyState
              title="Aucun paiement pour le moment"
              helper="Votre historique apparaîtra ici après votre premier paiement."
            />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {history.map((p) => (
                <div
                  key={p._id || p.transactionId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 8,
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #eef2f7',
                    borderRadius: 10
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {p.period?.month}/{p.period?.year} — {p.unitCode}
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.transactionId}</div>
                  </div>
                  <div style={{ fontWeight: 800 }}>
                    {formatFCFA(Number.isFinite(p.netAmount) && p.netAmount > 0 ? p.netAmount : p.amount)}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color:
                        p.status === 'ACCEPTED' ? '#065f46'
                        : p.status === 'REFUSED' ? '#991b1b'
                        : '#92400e'
                    }}
                  >
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="loye-card" style={styles.card}>
          <h3 style={styles.cardTitle}>🏠 Détails du logement</h3>
          <div style={styles.detailList}>
            <DetailRow label="Immeuble" value={field(unitData.propertyName, 'propertyName')} />
            <DetailRow label="Adresse" value={field(unitData.propertyAddress, 'propertyAddress')} />
            <DetailRow label="Type" value={field(unitData.unitType, 'unitType')} />
            <DetailRow label="Code logement" value={safeUnitCode || <span style={red}>(à relier à la DB: unitCode)</span>} />
            <DetailRow label="Loyer mensuel" value={field(Number.isFinite(unitData.rentAmount) ? formatFCFA(unitData.rentAmount) : '', 'rentAmount')} />
            <DetailRow label="Prochaine échéance" value={field(unitData.dueDate?.split?.(',')[0] || unitData.dueDate, 'dueDate')} />
            <DetailRow label="Fin du bail" value={field(unitData.leaseEnd, 'leaseEnd')} />
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="loye-card" style={styles.card}>
          <h3 style={styles.cardTitle}>📞 Informations de contact</h3>
          <div style={styles.infoRow}>
            <div style={{ flex: 1 }}>
              <h4 style={styles.infoHeader}>Vos infos</h4>
              <p style={styles.infoText}>
                📧 Email: {field(unitData.email, 'email')}
                <br />
                📞 Téléphone: {field(unitData.phone, 'phone')}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={styles.infoHeader}>Gestionnaire</h4>
              <p style={styles.infoText}>
                📧 Email: {field(unitData.mgmtEmail, 'mgmtEmail')}
                <br />
                📞 Téléphone: {field(unitData.mgmtPhone, 'mgmtPhone')}
                <br />
                ⏰ Heures: {field(unitData.hours, 'hours')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */
function MetricCard({ label, value, icon, dot }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLeft}>
        <p style={styles.metricLabel}>{label}</p>
        <h3 className="loye-metric-value" style={styles.metricValue}>{value}</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: '#f8fafc', border: '1px solid #eef2f7', position: 'relative' }}>
        {icon}
        <span style={{ position: 'absolute', right: -4, top: -4, width: 10, height: 10, background: dot, borderRadius: '50%' }} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="loye-detail-row" style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

function EmptyState({ title, helper }) {
  return (
    <div style={styles.emptyWrap}>
      <div style={styles.emptyIcon}>💳</div>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#64748b' }}>{helper}</div>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  container: { backgroundColor: '#f8fafc', padding: '2rem', minHeight: '100vh' },

  // skeleton blocks
  skel: {
    background: 'linear-gradient(90deg, #e9eef5 25%, #f3f6fb 37%, #e9eef5 63%)',
    backgroundSize: '400% 100%',
    borderRadius: 8,
    animation: 'skel 1.4s ease infinite'
  },

  headerRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  heading: { fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: 0.2 },
  iconInline: { marginRight: 6 },
  chip: {
    background: '#eef2ff',
    color: '#3730a3',
    border: '1px solid #e0e7ff',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700
  },

  banner: {
    padding: '1rem',
    borderRadius: '14px',
    margin: '1rem 0 1.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  bannerSuccess: { backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' },
  bannerWarning: { backgroundColor: '#fffbeb', border: '1px solid #fef3c7' },
  bannerDanger:  { backgroundColor: '#fef2f2', border: '1px solid #fee2e2' },

  bannerTitle: { fontWeight: 800, fontSize: '1rem', margin: 0 },
  bannerText: { margin: '6px 0 0', fontSize: '0.95rem', color: '#334155' },
  bannerButtons: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  waveReady: {
    backgroundColor: '#e0edff',
    padding: '0.35rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid #c7dbff'
  },
  waveText: { color: '#2563eb', fontWeight: 700 },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
    marginBottom: '1.4rem'
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #eef2f7'
  },
  metricLeft: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  metricLabel: { fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7 },
  metricValue: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 },

  tabsRow: {
    display: 'flex',
    gap: 8,
    marginBottom: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    padding: 4
  },
  tabBtn: {
    flex: 1,
    padding: '0.8rem',
    border: 'none',
    background: 'transparent',
    fontWeight: 800,
    cursor: 'pointer',
    color: '#475569',
    borderRadius: 8
  },
  activeTab: { backgroundColor: 'white', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },

  card: {
    backgroundColor: 'white',
    padding: '1.2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f7'
  },
  cardTitle: { fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.8rem' },

  detailList: { display: 'grid', gap: 10 },
  detailRow: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #eef2f7' },
  detailLabel: { color: '#64748b', fontWeight: 700 },
  detailValue: { color: '#0f172a', fontWeight: 700 },

  infoRow: { display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' },
  infoHeader: { fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' },
  infoText: { margin: 0, lineHeight: 1.8, color: '#334155' },

  emptyWrap: { border: '1px dashed #cbd5e1', borderRadius: 12, padding: 24, textAlign: 'center', color: '#0f172a', background: '#f8fafc' },
  emptyIcon: { width: 56, height: 56, borderRadius: '50%', background: '#eef2ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, fontSize: 22 }
};

export default LoyeDashboard;

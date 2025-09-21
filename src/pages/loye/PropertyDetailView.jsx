import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  FaArrowLeft,
  FaHome,
  FaUsers,
  FaChartLine,
  FaPhone,
  FaCheckCircle,
  FaMinusCircle,
} from 'react-icons/fa';

function formatFCFA(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  // 1 234 567 -> 1.234.567
  return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function avatarInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase() || '??';
}

export default function PropertyDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/loye/properties/${id}`);
        if (mounted) setProperty(res.data);
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const stats = useMemo(() => {
    const total = property?.units?.length || 0;
    const occupied = (property?.units || []).filter(u => !!u.renterId || !!u.renter).length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const vacant = total - occupied;
    return { total, occupied, vacant, rate };
  }, [property]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B1220', color: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtnDark}
            aria-label="Retour aux propriétés"
          >
            <FaArrowLeft /> &nbsp; Retour aux propriétés
          </button>
          <div style={{ height: 16 }} />
          <div style={{ height: 42, width: 320, background: 'rgba(255,255,255,0.12)', borderRadius: 10 }} />
          <div style={{ height: 12 }} />
          <div style={{ height: 18, width: 480, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc' }}>
        <div style={styles.emptyWrap}>
          <FaHome size={36} color="#ef4444" />
          <h2 style={{ margin: '12px 0 6px', fontWeight: 800 }}>Propriété introuvable</h2>
          <p style={{ color: '#475569', margin: 0 }}>La propriété demandée n'existe pas ou a été supprimée.</p>
          <button onClick={() => navigate('/loye/properties')} style={styles.primaryBtn}>Retour aux propriétés</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f8fb' }}>
      {/* Header band */}
      <div style={styles.headerBand}>
        <div style={styles.headerInner}>
          <button onClick={() => navigate(-1)} style={styles.backBtnDark}>
            <FaArrowLeft /> &nbsp; Retour aux propriétés
          </button>

          <h1 style={styles.title}>{property.name}</h1>
          <p style={styles.addressLine}>{property.address}</p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef2f7' }}>
        <div style={styles.container}>
          <div style={styles.kpiGrid}>
            <div style={{ ...styles.kpiCard, background: '#eef4ff', borderColor: '#dbe7ff' }}>
              <div style={styles.kpiIconWrap('#3b82f6')}>
                <FaHome color="#fff" />
              </div>
              <div>
                <div style={styles.kpiValue}>{stats.total}</div>
                <div style={{ ...styles.kpiLabel, color: '#1d4ed8' }}>Total unités</div>
              </div>
            </div>

            <div style={{ ...styles.kpiCard, background: '#eafaf0', borderColor: '#d2f1de' }}>
              <div style={styles.kpiIconWrap('#10b981')}>
                <FaUsers color="#fff" />
              </div>
              <div>
                <div style={styles.kpiValue}>{stats.occupied}</div>
                <div style={{ ...styles.kpiLabel, color: '#047857' }}>Occupées</div>
              </div>
            </div>

            <div style={{ ...styles.kpiCard, background: '#f2eafe', borderColor: '#e9d7fe' }}>
              <div style={styles.kpiIconWrap('#8b5cf6')}>
                <FaChartLine color="#fff" />
              </div>
              <div>
                <div style={styles.kpiValue}>{stats.rate}%</div>
                <div style={{ ...styles.kpiLabel, color: '#6d28d9' }}>Taux d'occupation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units */}
      <div style={styles.container}>
        <div style={{ margin: '24px 0 12px' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Unités de la propriété</h2>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>
            {stats.vacant > 0
              ? `${stats.vacant} unité${stats.vacant > 1 ? 's' : ''} disponible${stats.vacant > 1 ? 's' : ''}`
              : 'Toutes les unités sont occupées'}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {(property.units || []).map((unit, idx) => {
            const isOccupied = !!unit.renterId || !!unit.renter;
            const renter = unit.renter || null; // your backend may inject renter details as we added

            return (
              <div key={idx} style={styles.unitCard}>
                {/* Top row */}
                <div style={styles.unitTopRow}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={styles.unitType}>{(unit.type || '').toLowerCase()}</span>
                      <span style={styles.codeText}>Code: {unit.code}</span>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={styles.fcfaSymbol}>$</span>
                      <span style={styles.rentValue}>{formatFCFA(unit.rent)} FCFA</span>
                      <span style={{ color: '#94a3b8', fontSize: 14 }}>/ mois</span>
                    </div>
                  </div>

                  {isOccupied ? (
                    unit.latestPayment ? (
                        <span style={styles.badgePaid}>
                        <FaCheckCircle />&nbsp; Payé
                        </span>
                    ) : (
                        <span style={styles.badgeOccupied}>
                        <FaCheckCircle />&nbsp; Occupé
                        </span>
                    )
                    ) : (
                    <span style={styles.badgeVacant}>
                        <FaMinusCircle />&nbsp; Libre
                    </span>
                    )}

                </div>

                {/* Occupant or invite */}
                <div style={styles.divider} />

                {isOccupied ? (
                  <div style={styles.tenantWrap}>
                    {renter?.profilePic ? (
                      <img
                        src={renter.profilePic}
                        alt="Profil"
                        style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={styles.avatarCircle}>
                        {avatarInitials(renter?.name)}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 16 }}>{renter?.name || '—'}</strong>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                          <FaPhone /> {renter?.phone || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#334155' }}>
                    {unit.inviteCode ? (
                      <>
                        Code d'invitation:&nbsp;<strong>{unit.inviteCode}</strong>
                      </>
                    ) : (
                      <>Aucun code d'invitation pour l’instant</>
                    )}
                  </div>
                )}

                {/* Footer */}
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
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                        En attente
                    </span>
                    )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating help button */}
      <button aria-label="Aide" style={styles.helpFab}>?</button>
    </div>
  );
}

/* ========== styles ========== */
const styles = {
  container: { maxWidth: 960, margin: '0 auto', padding: '24px' },

  headerBand: {
    background: 'linear-gradient(135deg, #0b1220 0%, #0e1a34 100%)',
    color: '#fff',
  },
  headerInner: { maxWidth: 960, margin: '0 auto', padding: '24px' },
  backBtnDark: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  title: { margin: '12px 0 4px', fontSize: 32, fontWeight: 900 },
  addressLine: { margin: 0, opacity: 0.9 },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    padding: '18px 0',
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    border: '1px solid',
  },
  kpiIconWrap: (bg) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: bg,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
  }),
  kpiValue: { fontSize: 26, fontWeight: 900, lineHeight: 1 },
  kpiLabel: { fontSize: 13, fontWeight: 700, marginTop: 2 },

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

  emptyWrap: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 24,
    textAlign: 'center',
    width: 420,
    boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
  },
  primaryBtn: {
    marginTop: 14,
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },

  helpFab: {
    position: 'fixed',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, #0b1220 0%, #0e1a34 100%)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,0.18)',
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
  
};

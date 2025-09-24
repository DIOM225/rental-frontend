import React from 'react';
import { FaHome, FaUsers, FaChartLine } from 'react-icons/fa';

function PropertyStats({ stats }) {
  return (
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
  );
}

const styles = {
  container: { maxWidth: 960, margin: '0 auto', padding: '24px' },
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
};

export default PropertyStats;

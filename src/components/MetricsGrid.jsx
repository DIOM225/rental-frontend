// 📄 src/components/MetricsGrid.jsx
import { FaMoneyBillWave, FaCalendarAlt, FaClock, FaHome } from 'react-icons/fa';
import { formatFCFA, isBlank } from '../utils/formatting';

const red = { color: '#dc2626', fontWeight: 600 };

function MetricsGrid({ unitData }) {
  const field = (val, label) =>
    isBlank(val) && !Number.isFinite(val)
      ? <span style={red}>(à relier à la DB: {label})</span>
      : <>{val}</>;

  const metricStyle = {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #eef2f7'
  };

  const valueStyle = {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0
  };

  const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.7
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
    marginBottom: '1.4rem'
  };

  return (
    <div className="loye-metrics" style={gridStyle}>
      <MetricCard
        label="Loyer mensuel"
        value={field(Number.isFinite(unitData.rentAmount) ? formatFCFA(unitData.rentAmount) : '', 'rentAmount')}
        icon={<FaMoneyBillWave size={18} color="#065f46" />}
        dot="#10B981"
        styles={{ metricStyle, labelStyle, valueStyle }}
      />
      <MetricCard
        label="Prochaine échéance"
        value={field(unitData.dueDate?.split?.(',')[0] || unitData.dueDate, 'dueDate')}
        icon={<FaCalendarAlt size={18} color="#1d4ed8" />}
        dot="#3B82F6"
        styles={{ metricStyle, labelStyle, valueStyle }}
      />
      <MetricCard
        label="Fin du bail"
        value={field(unitData.leaseEnd, 'leaseEnd')}
        icon={<FaClock size={18} color="#6d28d9" />}
        dot="#8B5CF6"
        styles={{ metricStyle, labelStyle, valueStyle }}
      />
      <MetricCard
        label="Type"
        value={field(unitData.unitType, 'unitType')}
        icon={<FaHome size={18} color="#c2410c" />}
        dot="#F97316"
        styles={{ metricStyle, labelStyle, valueStyle }}
      />
    </div>
  );
}

function MetricCard({ label, value, icon, dot, styles }) {
  const { metricStyle, labelStyle, valueStyle } = styles;

  return (
    <div style={metricStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <p style={labelStyle}>{label}</p>
        <h3 className="loye-metric-value" style={valueStyle}>{value}</h3>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 12,
        background: '#f8fafc',
        border: '1px solid #eef2f7',
        position: 'relative'
      }}>
        {icon}
        <span style={{
          position: 'absolute',
          right: -4,
          top: -4,
          width: 10,
          height: 10,
          background: dot,
          borderRadius: '50%'
        }} />
      </div>
    </div>
  );
}

export default MetricsGrid;

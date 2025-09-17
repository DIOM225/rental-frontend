// 📄 src/components/RentMetrics.jsx
import { FaMoneyBillWave, FaCalendarAlt, FaClock, FaHome } from 'react-icons/fa';
import MetricCard from './MetricCard';
import { formatFCFA, fmtDate, dueDate10 } from '../utils/formatting';

function RentMetrics({ unitData, field }) {
  return (
    <div className="loye-metrics" style={styles.metricsRow}>
      <MetricCard
        label="Loyer mensuel"
        value={field(
          Number.isFinite(unitData?.rentAmount) ? formatFCFA(unitData.rentAmount) : '',
          'rentAmount'
        )}
        icon={<FaMoneyBillWave size={18} color="#065f46" />}
        dot="#10B981"
      />

      <MetricCard
        label="Prochaine échéance"
        value={field(
          fmtDate(dueDate10(unitData?.dueDate || new Date())),
          'dueDate'
        )}
        icon={<FaCalendarAlt size={18} color="#1d4ed8" />}
        dot="#3B82F6"
      />

      <MetricCard
        label="Fin du bail"
        value={field(unitData?.leaseEnd || '', 'leaseEnd')}
        icon={<FaClock size={18} color="#6d28d9" />}
        dot="#8B5CF6"
      />

      <MetricCard
        label="Type"
        value={field(unitData?.unitType || '', 'unitType')}
        icon={<FaHome size={18} color="#c2410c" />}
        dot="#F97316"
      />
    </div>
  );
}

const styles = {
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
    marginBottom: '1.4rem'
  }
};

export default RentMetrics;

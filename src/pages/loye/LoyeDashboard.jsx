// 📄 client/src/pages/loye/LoyeDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import axios from '../../utils/axiosInstance';

import RentBanner from '../../components/RentBanner';
import RentMetrics from '../../components/RentMetrics';
import PaymentHistory from '../../components/PaymentHistory';
import ContactDetails from '../../components/ContactDetails';

import { capitalizeWords, isBlank, formatFCFA } from '../../utils/formatting';

function LoyeDashboard() {
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);

  // tabs
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'contact'

  // payment history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const red = { color: '#dc2626', fontWeight: 600 };

  // Load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/loye/renter/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const raw = res?.data || {};
        const localUser = JSON.parse(localStorage.getItem('user') || 'null');

        const normalized = {
          name: raw?.name || raw?.user?.name || localUser?.name,
          unit: raw?.unit || raw?.unitLabel || raw?.unitName,
          unitCode: raw?.unitCode || raw?.unit?.code,
          rentAmount:
            typeof raw?.rentAmount === 'number'
              ? raw.rentAmount
              : (typeof raw?.rent === 'number' ? raw.rent : undefined),

          // ✅ Add rentDueDate from backend
          rentDueDate: raw?.rentDueDate || raw?.unit?.rentDueDate || 10,

          dueDate: raw?.dueDate || raw?.nextDueDate || raw?.dueDateText,
          daysRemaining: raw?.daysRemaining,
          leaseEnd: raw?.leaseEnd || raw?.leaseEndText,
          unitType: raw?.unitType || raw?.type || raw?.unit?.type,
          email: raw?.email || raw?.user?.email,   // ✅ renter email
          phone: raw?.phone || raw?.user?.phone,   // ✅ renter phone

          // ✅ Manager info (fallback to owner if manager not available)
          mgmtEmail:
            raw?.mgmtEmail ||
            raw?.manager?.email ||
            raw?.owner?.email ||
            null,
          mgmtPhone:
            raw?.mgmtPhone ||
            raw?.manager?.phone ||
            raw?.owner?.phone ||
            null,
          hours:
            raw?.hours ||
            raw?.manager?.hours ||
            raw?.officeHours ||
            raw?.owner?.hours ||
            null,

          propertyName: raw?.propertyName,
          propertyAddress: raw?.propertyAddress,

          // placeholder, will update after payments fetch
          rentStatus: "unpaid"
        };

        setUnitData(normalized);
        console.log("📦 Normalized renter data:", normalized);
      } catch (e) {
        setUnitData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Inject CinetPay fullscreen modal patch (mobile)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cinetpay-modal-patch')) return;

    const s = document.createElement('style');
    s.id = 'cinetpay-modal-patch';
    s.innerHTML = `
      #cinetpay-checkout,
      #cinetpay-checkout iframe,
      .modal_cinetpay,
      .CPmodal,
      .cinetpay-modal,
      .cinetpay-modal iframe {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        z-index: 2147483647 !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .modal_cinetpay *,
      #cinetpay-checkout * {
        transform: none !important;
      }
    `;
    document.head.appendChild(s);
  }, []);

  // read stored unit code once
  const storedUnitCode = useMemo(() => {
    try {
      return localStorage.getItem('loye.unitCode') || null;
    } catch {
      return null;
    }
  }, []);

  const safeUnitCode = storedUnitCode || unitData?.unitCode || null;
  const unitLabel = unitData?.unit || '';
  const showUnitChip = Boolean(safeUnitCode && !(unitLabel || '').includes(safeUnitCode));

  // field helper for fallbacks
  const field = (val, labelForFallback) =>
    (isBlank(val) && !Number.isFinite(val))
      ? <span style={red}>(à relier à la DB: {labelForFallback})</span>
      : <>{val}</>;

  // fetch renter payment history when unitCode is known
  useEffect(() => {
    if (!safeUnitCode) return;

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/loye/renter/payments', {
          params: { unitCode: safeUnitCode },
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(Array.isArray(data?.payments) ? data.payments : []);

        // ✅ store rentStatus from backend
        setUnitData(prev => ({ ...prev, rentStatus: data?.rentStatus || "unpaid" }));
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [safeUnitCode]);

  // payment callbacks
  const handleAccepted = async () => {
    if (safeUnitCode) {
      try {
        setHistoryLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/loye/renter/payments', {
          params: { unitCode: safeUnitCode },
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(Array.isArray(data?.payments) ? data.payments : []);

        // ✅ refresh rentStatus too
        setUnitData(prev => ({ ...prev, rentStatus: data?.rentStatus || "unpaid" }));
      } catch {
        // ignore
      } finally {
        setHistoryLoading(false);
      }
    }
    alert('Paiement accepté ✅');
  };

  const handleRefused = () => {
    alert('Paiement refusé ❌');
  };

  const handleClosed = () => {
    // no log
  };

  if (loading || !unitData) {
    return <div style={{ padding: '2rem', fontWeight: 600 }}>Chargement...</div>;
  }

  return (
    <div className="loye-container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="loye-header" style={{ marginBottom: 16 }}>
        <h2 className="loye-heading" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Bienvenue, {capitalizeWords(field(unitData.name, 'name'))}
        </h2>

        <div
          className="loye-header-sub"
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', color: '#475569' }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <FaMapMarkerAlt style={{ marginRight: 6 }} />
            {field(unitLabel, 'unit')}
          </span>

          {showUnitChip && (
            <span
              className="loye-chip"
              style={{
                background: '#eef2ff',
                color: '#3730a3',
                border: '1px solid #e0e7ff',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700
              }}
            >
              Code: {safeUnitCode}
            </span>
          )}
        </div>
      </div>

      {/* Payment Banner */}
      <RentBanner
        unitData={unitData}
        rentStatus={unitData?.rentStatus}   // ✅ pass rentStatus
        renterPhone={unitData?.phone}      // ✅ pass phone
        renterEmail={unitData?.email}      // ✅ pass email too
        field={field}
        safeUnitCode={safeUnitCode}
        onAccepted={handleAccepted}
        onRefused={handleRefused}
        onClosed={handleClosed}
      />

      {/* Metrics */}
      <RentMetrics unitData={unitData} field={field} />

      {/* Tabs */}
      <div
        className="loye-tabs"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: '1rem',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          padding: 4
        }}
      >
        {['history', 'contact'].map((tab) => (
          <button
            key={tab}
            className="loye-tab"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.8rem',
              border: 'none',
              background: activeTab === tab ? 'white' : 'transparent',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === tab ? '#0f172a' : '#475569',
              borderRadius: 8,
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.05)' : undefined
            }}
          >
            {tab === 'history' ? 'Historique' : 'Contact'}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'history' && (
        <PaymentHistory
          history={history}
          historyLoading={historyLoading}
          formatFCFA={formatFCFA}
        />
      )}

      {activeTab === 'contact' && (
        <ContactDetails unitData={unitData} field={field} />
      )}
    </div>
  );
}

export default LoyeDashboard;

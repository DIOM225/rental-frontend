// 📄 src/hooks/useDashboardData.js
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { fmtDate, normalizePhoneCI } from '../utils/formatting';

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
    propertyAddress: raw?.propertyAddress,
  };
  return out;
}

export function useDashboardData() {
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const normalizedPhone = normalizePhoneCI(unitData?.phone);

  return { unitData, loading, normalizedPhone };
}

// client/src/components/PayRentButton.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";

// Load CinetPay SDK
function loadCinetPayScript() {
  const SRC = "https://cdn.cinetpay.com/seamless/main.js";
  return new Promise((resolve, reject) => {
    if (window.CinetPay) return resolve(window.CinetPay);
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(window.CinetPay);
    s.onerror = () => reject(new Error("CinetPay SDK failed to load"));
    document.head.appendChild(s);
  });
}

export default function PayRentButton({
  unitCode,
  amountXof,
  period,
  renterName,
  renterEmail,
  renterCountry = "CI",

  label = "Payer le loyer",
  className = "",

  // Optional callbacks for future use
  onAccepted,
  onRefused,
  onClosed,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initDataRef = useRef(null);

  // Fetch payment init payload
  useEffect(() => {
    async function fetchInit() {
      setError("");
      if (!unitCode || !amountXof || !period?.year || !period?.month) return;
      if (amountXof % 5 !== 0) return;

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/loye/payments/cinetpay/init-seamless`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              unitCode,
              amount: amountXof,
              period,
              renterName,
              renterEmail,
            }),
          }
        );

        const data = await res.json();
        if (res.ok && data.ok) {
          initDataRef.current = data;
        } else {
          throw new Error(data.error || "Échec de l'initialisation");
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }

    fetchInit();
  }, [unitCode, amountXof, period, renterName, renterEmail]);

  const startPayment = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const data = initDataRef.current;
      if (!data) throw new Error("Paiement non prêt");

      const CinetPay = await loadCinetPayScript();

      CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "PRODUCTION",
        notify_url: data.notify_url,
      });

      const payload = {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        channels: data.channels,
        lang: data.lang,
        return_url: data.return_url,
        customer_name: data.customer_name,
        customer_surname: data.customer_surname,
        customer_email: data.customer_email,
        customer_country: data.customer_country,
        phone_prefixe: data.phone_prefixe,
      };

      // Cleanup undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      // Open payment modal
      CinetPay.getCheckout(payload);

      // ❗ No event listeners like onPaymentSuccess etc — they don't exist in Seamless SDK
      // You must handle final status via backend notify_url + return_url
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white shadow ${
          loading ? "opacity-50 cursor-wait" : "hover:opacity-90"
        }`}
        style={{ background: "#0ea5e9" }}
      >
        {loading ? "Chargement..." : label}
      </button>

      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}

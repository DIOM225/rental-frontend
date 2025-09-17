// 📄 client/src/components/PayRentButton.jsx
import React, { useCallback, useMemo, useRef, useState } from "react";

/** Load the CinetPay Seamless SDK once */
function loadCinetPayScript() {
  const SRC = "https://cdn.cinetpay.com/seamless/main.js";
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.CinetPay) return resolve(window.CinetPay);

    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.CinetPay));
      existing.addEventListener("error", () => reject(new Error("CinetPay script failed to load")));
      return;
    }

    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(window.CinetPay);
    s.onerror = () => reject(new Error("CinetPay script failed to load"));
    document.head.appendChild(s);
  });
}

/**
 * PayRentButton (Seamless CinetPay)
 *
 * REQUIRED props:
 * - unitCode       (string)
 * - period         ({ year:number, month:number })
 * - amountXof      (integer, multiple of 5)
 *
 * OPTIONAL:
 * - renterPhone10  ("07xxxxxxxx" 10 digits, no +225)
 * - renterName     (free string; server splits)
 * - renterEmail
 * - channels       (string) – default "MOBILE_MONEY,WALLET" but we’ll force 'ALL' for web when calling SDK
 * - renterCountry  (ISO-2) default 'CI'
 * - lockPhone      (boolean) default true
 * - onAccepted/onRefused/onClosed (callbacks)
 */
export default function PayRentButton({
  unitCode,
  period,
  amountXof,

  // optional
  renterPhone10,
  renterName,
  renterEmail,

  label = "Payer le loyer",
  channels = "MOBILE_MONEY,WALLET",
  className = "",
  onAccepted,
  onRefused,
  onClosed,
  renterCountry = "CI",
  lockPhone = true,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef(null);

  // Strict period (no fallback)
  const safePeriod = useMemo(() => {
    if (!period || !Number(period?.year) || !Number(period?.month)) return null;
    return { year: Number(period.year), month: Number(period.month) };
  }, [period]);

  // Strict amount (must be integer & multiple of 5)
  const safeAmount = useMemo(() => {
    if (typeof amountXof !== "number" || !Number.isFinite(amountXof)) return null;
    if (!Number.isInteger(amountXof)) return null;
    return amountXof;
  }, [amountXof]);

  // 10-digit phone only (no +225 here)
  const phone10 = useMemo(() => {
    const v = String(renterPhone10 || "").trim();
    return /^\d{10}$/.test(v) ? v : undefined;
  }, [renterPhone10]);

  // Body we POST to backend
  const body = useMemo(() => {
    return {
      unitCode,
      period: safePeriod,
      amount: safeAmount,
      renterPhone10: phone10,
      renterName: (renterName || "").trim() || undefined,
      renterEmail: (renterEmail || "").trim() || undefined,
      channels: channels || undefined, // server normalizes to ALL anyway
    };
  }, [unitCode, safePeriod, safeAmount, phone10, renterName, renterEmail, channels]);

  const startCheckout = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      // Guards
      if (!unitCode) throw new Error("unitCode manquant");
      if (!safePeriod) throw new Error("period.year et period.month sont requis");
      if (safeAmount == null) throw new Error("amountXof est requis");
      if (safeAmount % 5 !== 0) throw new Error("Le montant doit être un multiple de 5");

      const API_BASE =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_API_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

      // 1) Init on backend
      const res = await fetch(`${API_BASE}/api/loye/payments/cinetpay/init-seamless`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !(data && data.ok)) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Basic checks
      if (!data.transaction_id) throw new Error("transaction_id manquant (serveur)");
      if (!data.amount || data.amount % 5 !== 0) throw new Error("Montant invalide (serveur)");
      if (!data.currency) throw new Error("Devise manquante (serveur)");
      responseRef.current = data;

      // 2) Load SDK
      await loadCinetPayScript();
      if (!window.CinetPay) throw new Error("SDK CinetPay indisponible");

      // 3) setConfig — only supported keys
      window.CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "PRODUCTION",
      });

      // 4) Build payload for checkout — use backend response AS-IS
      const checkoutPayload = {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        description: data.description || "Paiement de loyer",
        channels: data.channels || "ALL", // safest for web
        lang: data.lang || "fr",
        notify_url: data.notify_url,
        return_url: data.return_url,

        // Routing hints
        customer_country: data.customer_country || (renterCountry || "CI"),
        phone_prefixe: data.phone_prefixe || "225",
        customer_phone_number: data.customer_phone_number ?? phone10,
        lock_phone_number:
          typeof data.lock_phone_number === "boolean"
            ? data.lock_phone_number
            : phone10 && lockPhone
            ? true
            : undefined,

        // Optional customer fields (server may already have set them)
        customer_name: data.customer_name,
        customer_surname: data.customer_surname,
        customer_email: data.customer_email || renterEmail,
      };

      // Strip undefined
      Object.keys(checkoutPayload).forEach(
        (k) => checkoutPayload[k] === undefined && delete checkoutPayload[k]
      );

      // 5) Attach listeners BEFORE getCheckout for better error visibility
      if (typeof window.CinetPay.onError === "function") {
        window.CinetPay.onError((evt) => {
          console.error("CinetPay onError evt:", evt);
          setError(
            evt?.description ||
              evt?.message ||
              "An error occurred while processing the request"
          );
          onRefused?.(evt);
        });
      }

      if (typeof window.CinetPay.onClose === "function") {
        window.CinetPay.onClose(() => {
          onClosed?.();
          setLoading(false);
        });
      }

      if (typeof window.CinetPay.onPaymentPending === "function") {
        window.CinetPay.onPaymentPending((evt) => {
          console.log("CinetPay pending:", evt);
        });
      }

      if (typeof window.CinetPay.onPaymentSuccess === "function") {
        window.CinetPay.onPaymentSuccess((evt) => {
          console.log("CinetPay success:", evt);
          onAccepted?.(evt);
          setLoading(false);
        });
      }

      // 6) Go!
      await window.CinetPay.getCheckout(checkoutPayload);
    } catch (e) {
      console.error("CinetPay error:", e?.response?.data || e.message || e);
      setError(
        e?.response?.data?.description ||
          e?.response?.data?.message ||
          e?.message ||
          "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  }, [
    unitCode,
    safePeriod,
    safeAmount,
    renterCountry,
    lockPhone,
    renterEmail,
    body,
    onAccepted,
    onRefused,
    onClosed,
  ]);

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading || !unitCode}
        className={`px-4 py-2 rounded-2xl shadow text-white ${
          loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
        }`}
        style={{ background: "#0ea5e9" }}
        aria-busy={loading}
      >
        {loading ? "Ouverture du paiement…" : label}
      </button>

      {error ? (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {process.env.NODE_ENV !== "production" && responseRef.current ? (
        <details className="text-xs text-gray-500">
          <summary>Debug: init response</summary>
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(responseRef.current, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

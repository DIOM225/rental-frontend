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
 * Required props:
 * - unitCode        (string)
 * - period          ({ year:number, month:number })
 * - amountXof       (integer, multiple of 5)
 *
 * Optional props:
 * - renterPhone10   ("07xxxxxxxx" 10 digits, no +225)
 * - renterName, renterSurname, renterEmail
 * - channels        ('ALL'|'MOBILE_MONEY'|'CREDIT_CARD'|'WALLET')
 * - renterCountry   (ISO-2) default 'CI'
 */
export default function PayRentButton({
  unitCode,
  period,
  amountXof,
  renterPhone10,
  renterName,
  renterSurname,
  renterEmail,
  label = "Payer le loyer",
  channels = "MOBILE_MONEY,WALLET", // show Wave + Orange Money
  className = "",
  onAccepted,
  onRefused,
  onClosed,
  renterCountry = "CI",
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

  // 10-digit phone only (no +225 here; docs expect the raw number)
  const phone10 = useMemo(() => {
    const v = String(renterPhone10 || "").trim();
    return /^\d{10}$/.test(v) ? v : undefined;
  }, [renterPhone10]);

  // Body we POST to backend (no placeholders)
  const body = useMemo(() => {
    return {
      unitCode,
      period: safePeriod,
      amount: safeAmount,
      renterPhone10: phone10,
    };
  }, [unitCode, safePeriod, safeAmount, phone10]);

  const startCheckout = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      // Guard: required inputs present before hitting the server
      if (!unitCode) throw new Error("unitCode manquant");
      if (!safePeriod) throw new Error("period.year et period.month sont requis");
      if (safeAmount == null) throw new Error("amountXof est requis");
      if (safeAmount % 5 !== 0) throw new Error("Le montant doit être un multiple de 5");

      const API_BASE =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_API_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

      // 1) Ask backend to init (server ensures unique transaction_id, etc.)
      const res = await fetch(`${API_BASE}/api/loye/payments/cinetpay/init-seamless`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Échec d'initialisation du paiement");
      }

      // Minimal checks on response
      if (!data.transaction_id) throw new Error("transaction_id manquant (serveur)");
      if (!data.amount || data.amount % 5 !== 0) throw new Error("Montant invalide (serveur)");
      if (!data.currency) throw new Error("Devise manquante (serveur)");
      responseRef.current = data;

      // 2) Load SDK
      await loadCinetPayScript();
      if (!window.CinetPay) throw new Error("SDK CinetPay indisponible");

      // 3) setConfig (server-supplied values)
      window.CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "PRODUCTION",
        notify_url: data.notify_url,
        // close_after_response: true, // optional
      });

      // 4) Build payload for getCheckout — use **documented** keys only
      const payload = {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        channels: data.channels || channels,  // "MOBILE_MONEY,WALLET" by default
        description: data.description || "Paiement de loyer",
        lang: data.lang || "fr",
        return_url: data.return_url,          // optional but supported

        // -> these are the keys CinetPay actually reads for routing
        customer_country: renterCountry || "CI",
        customer_phone_number: phone10,       // 10 digits (no +225)

        // (optional, helpful esp. for card flows)
        customer_name: renterName,
        customer_surname: renterSurname,
        customer_email: renterEmail,
      };

      // Remove undefined keys to avoid SDK warnings
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      // 5) Launch checkout
      window.CinetPay.getCheckout(payload);

      // 6) Listen for front-end status (authoritative is webhook + /v2/payment/check)
      window.CinetPay.waitResponse((resp) => {
        if (resp?.status === "ACCEPTED") onAccepted?.(resp);
        else if (resp?.status === "REFUSED") onRefused?.(resp);
      });

      if (typeof window.CinetPay.onError === "function") {
        window.CinetPay.onError((err) => {
          console.error("CinetPay error:", err);
          setError(err?.description || err?.message || "Erreur de paiement");
        });
      }
      if (typeof window.CinetPay.onClose === "function") {
        window.CinetPay.onClose(() => onClosed?.());
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [
    body,
    channels,
    onAccepted,
    onClosed,
    onRefused,
    renterCountry,
    renterEmail,
    renterName,
    renterSurname,
    phone10,
    safeAmount,
    safePeriod,
    unitCode,
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

// 📄 client/src/components/PayRentButton.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Load the CinetPay Seamless SDK once */
function loadCinetPayScript() {
  const SRC = "https://cdn.cinetpay.com/seamless/main.js";
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.CinetPay) return resolve(window.CinetPay);

    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      const onLoad = () => resolve(window.CinetPay);
      const onErr  = () => reject(new Error("CinetPay script failed to load"));
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onErr, { once: true });
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

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * PayRentButton (Seamless CinetPay) — wallet/mobile compliant
 */
export default function PayRentButton({
  unitCode,
  period,
  amountXof,

  // optional (we will NOT send phone to SDK; CinetPay UI collects it)
  renterPhone10,
  renterName,
  renterEmail,

  label = "Payer le loyer",
  className = "",
  onAccepted,
  onRefused,
  onClosed,
  renterCountry = "CI",
  // lockPhone is ignored for the SDK payload (kept for future use/UX)
  lockPhone = true,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef(null);
  const initCacheRef = useRef(null); // { stamp:number, data:object }

  // Inject fullscreen modal CSS patch (Safari/Android); no aggressive transform resets
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("cinetpay-modal-patch")) return;

    const s = document.createElement("style");
    s.id = "cinetpay-modal-patch";
    s.innerHTML = `
      html, body { height: 100% !important; }
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
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(s);
  }, []);

  // Preload SDK ASAP so it’s ready by the time user taps
  useEffect(() => {
    loadCinetPayScript().catch(() => {});
  }, []);

  // Strict period
  const safePeriod = useMemo(() => {
    if (!period || !Number(period?.year) || !Number(period?.month)) return null;
    return { year: Number(period.year), month: Number(period.month) };
  }, [period]);

  // Strict amount
  const safeAmount = useMemo(() => {
    if (typeof amountXof !== "number" || !Number.isFinite(amountXof)) return null;
    if (!Number.isInteger(amountXof)) return null;
    return amountXof;
  }, [amountXof]);

  // 10-digit phone only (no +225) — we DO NOT send this to CinetPay; UI collects it.
  const phone10 = useMemo(() => {
    const v = String(renterPhone10 || "").trim();
    return /^\d{10}$/.test(v) ? v : undefined;
  }, [renterPhone10]);

  // Body we POST to backend (server returns compliant payload for SDK)
  const body = useMemo(() => {
    return {
      unitCode,
      period: safePeriod,
      amount: safeAmount,
      renterPhone10: phone10, // kept server-side only for audit/snapshot; not sent to SDK
      renterName: (renterName || "").trim() || undefined,
      renterEmail: (renterEmail || "").trim() || undefined,
      channels: "ALL", // server keeps/normalizes; we still force WALLET on mobile at SDK call
    };
  }, [unitCode, safePeriod, safeAmount, phone10, renterName, renterEmail]);

  // Pre-initialize payment so click -> immediate getCheckout (preserve gesture)
  useEffect(() => {
    async function preInit() {
      try {
        setError("");
        if (!unitCode || !safePeriod || safeAmount == null || safeAmount % 5 !== 0) return;

        const API_BASE =
          process.env.REACT_APP_API_BASE_URL ||
          process.env.REACT_APP_API_URL ||
          (typeof window !== "undefined" ? window.location.origin : "");

        const res = await fetch(`${API_BASE}/api/loye/payments/cinetpay/init-seamless`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !(data && data.ok)) return;
        if (!data.transaction_id || !data.amount || !data.currency) return;

        initCacheRef.current = { stamp: Date.now(), data };
      } catch {
        // ignore background errors; we’ll retry on click
      }
    }
    preInit();
  }, [unitCode, safePeriod, safeAmount, body]);

  // Helper to get cached-or-fresh init (returns null if not ready)
  const getCachedInit = useCallback(() => {
    const cached = initCacheRef.current;
    if (cached && Date.now() - cached.stamp < 3 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }, []);

  const startCheckout = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      // Guards
      if (!unitCode) throw new Error("unitCode manquant");
      if (!safePeriod) throw new Error("period.year et period.month sont requis");
      if (safeAmount == null) throw new Error("amountXof est requis");
      if (safeAmount % 5 !== 0) throw new Error("Le montant doit être un multiple de 5");

      // Need init payload BEFORE getCheckout (mobile gesture)
      let data = getCachedInit();
      if (!data) {
        const API_BASE =
          process.env.REACT_APP_API_BASE_URL ||
          process.env.REACT_APP_API_URL ||
          (typeof window !== "undefined" ? window.location.origin : "");

        const res = await fetch(`${API_BASE}/api/loye/payments/cinetpay/init-seamless`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        data = await res.json();
        if (!res.ok || !(data && data.ok)) {
          const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        initCacheRef.current = { stamp: Date.now(), data };
      }

      if (!data.transaction_id) throw new Error("transaction_id manquant (serveur)");
      if (!data.amount || data.amount % 5 !== 0) throw new Error("Montant invalide (serveur)");
      if (!data.currency) throw new Error("Devise manquante (serveur)");
      responseRef.current = data;

      // Ensure SDK is ready (already preloaded)
      await loadCinetPayScript();
      if (!window.CinetPay) throw new Error("SDK CinetPay indisponible");

      // Configure
      window.CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "PRODUCTION",
      });

      // Build checkout payload — device-aware channels; NO phone/lock fields (docs-compliant)
      const mobile = isMobile();
      const checkoutPayload = {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        description: data.description || "Paiement de loyer",
        channels: mobile ? "WALLET" : (data.channels || "ALL"),
        lang: data.lang || "fr",
        notify_url: data.notify_url,
        return_url: data.return_url,

        customer_country: data.customer_country || (renterCountry || "CI"),
        phone_prefixe: data.phone_prefixe || "225",

        // ❌ Do NOT pass phone or lock flags — Wallet/MoMo collect phone in the widget
        // customer_phone_number: (omitted)
        // lock_phone_number: (omitted)

        // Optional customer fields — fine for CARD; safe to include when present
        customer_name: data.customer_name,
        customer_surname: data.customer_surname,
        customer_email: data.customer_email || renterEmail,
      };

      // Strip undefined
      Object.keys(checkoutPayload).forEach(
        (k) => checkoutPayload[k] === undefined && delete checkoutPayload[k]
      );

      // Attach listeners BEFORE getCheckout
      if (typeof window.CinetPay.onError === "function") {
        window.CinetPay.onError((evt) => {
          console.error("CinetPay onError evt:", evt);
          setError(
            evt?.description ||
            evt?.message ||
            "Une erreur est survenue pendant le paiement"
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

      // 🚀 Launch checkout immediately (user gesture preserved on mobile)
      window.CinetPay.getCheckout(checkoutPayload);

      // (Optional) Watchdog: if modal not visible after ~2s on mobile, you can open hosted fallback here.
      // See prior message if you want me to wire that up too.
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
    renterEmail,
    body,
    onAccepted,
    onRefused,
    onClosed,
    getCachedInit,
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

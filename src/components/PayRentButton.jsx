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

/** Strong, mobile-first patch to make the CinetPay modal/iframe fully visible */
function injectCinetPayModalPatch() {
  if (typeof document === "undefined") return;
  const id = "cinetpay-modal-patch-strong";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    html, body { height: 100% !important; overflow: hidden !important; }
    /* Container(s) CinetPay uses */
    #cinetpay-checkout,
    .cinetpay-modal,
    .CPmodal,
    .modal_cinetpay {
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
      transform: none !important;
    }
    /* The iframe itself must fill the screen and be visible */
    #cinetpay-checkout iframe,
    .cinetpay-modal iframe,
    .CPmodal iframe,
    .modal_cinetpay iframe {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      min-width: 100vw !important;
      min-height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      transform: none !important;
    }
    /* Some versions animate/scale inner wrappers; cancel that so content shows */
    #cinetpay-checkout *, 
    .cinetpay-modal *, 
    .CPmodal *, 
    .modal_cinetpay * {
      transform: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  `;
  document.head.appendChild(style);
}

/** Re-assert patch a moment after the modal mounts (helps iOS Safari) */
function nudgeModalVisibility() {
  if (typeof document === "undefined") return;
  // Re-apply styles quickly a few times in case their styles override late
  let ticks = 0;
  const maxTicks = 6; // ~1.2s total
  const interval = setInterval(() => {
    ticks += 1;
    injectCinetPayModalPatch();
    const frame =
      document.querySelector("#cinetpay-checkout iframe") ||
      document.querySelector(".cinetpay-modal iframe") ||
      document.querySelector(".CPmodal iframe") ||
      document.querySelector(".modal_cinetpay iframe");

    if (frame && frame.offsetWidth > 0 && frame.offsetHeight > 0) {
      clearInterval(interval);
    }
    if (ticks >= maxTicks) clearInterval(interval);
  }, 200);
}

/**
 * PayRentButton (Seamless CinetPay) — wallet/mobile compliant
 */
export default function PayRentButton({
  unitCode,
  period,
  amountXof,

  // optional (we do NOT send phone to SDK; CinetPay UI collects it)
  renterPhone10,
  renterName,
  renterEmail,

  label = "Payer le loyer",
  className = "",
  onAccepted,
  onRefused,
  onClosed,
  renterCountry = "CI",
  // kept for future UX; not sent to SDK
  lockPhone = true,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef(null);
  const initCacheRef = useRef(null); // { stamp:number, data:object }

  // Apply patch early and preload SDK
  useEffect(() => {
    injectCinetPayModalPatch();
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

  // Keep phone for server snapshot only
  const phone10 = useMemo(() => {
    const v = String(renterPhone10 || "").trim();
    return /^\d{10}$/.test(v) ? v : undefined;
  }, [renterPhone10]);

  // Body -> backend init
  const body = useMemo(() => {
    return {
      unitCode,
      period: safePeriod,
      amount: safeAmount,
      renterPhone10: phone10, // server snapshot only
      renterName: (renterName || "").trim() || undefined,
      renterEmail: (renterEmail || "").trim() || undefined,
      channels: "ALL", // ✅ always ALL
    };
  }, [unitCode, safePeriod, safeAmount, phone10, renterName, renterEmail]);

  // Pre-init so click -> immediate getCheckout
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
        /* ignore background errors */
      }
    }
    preInit();
  }, [unitCode, safePeriod, safeAmount, body]);

  const getCachedInit = useCallback(() => {
    const cached = initCacheRef.current;
    if (cached && Date.now() - cached.stamp < 3 * 60 * 1000) return cached.data;
    return null;
  }, []);

  const startCheckout = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (!unitCode) throw new Error("unitCode manquant");
      if (!safePeriod) throw new Error("period.year et period.month sont requis");
      if (safeAmount == null) throw new Error("amountXof est requis");
      if (safeAmount % 5 !== 0) throw new Error("Le montant doit être un multiple de 5");

      // get init (cached or fresh)
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

      await loadCinetPayScript();
      if (!window.CinetPay) throw new Error("SDK CinetPay indisponible");

      window.CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "PRODUCTION",
      });

      // ✅ Always ALL (per your choice), no phone fields (modal collects it)
      const checkoutPayload = {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        description: data.description || "Paiement de loyer",
        channels: data.channels || "ALL",
        lang: data.lang || "fr",
        notify_url: data.notify_url,
        return_url: data.return_url,
        customer_country: data.customer_country || (renterCountry || "CI"),
        phone_prefixe: data.phone_prefixe || "225",
        // customer_phone_number: (omit)
        // lock_phone_number: (omit)
        customer_name: data.customer_name,
        customer_surname: data.customer_surname,
        customer_email: data.customer_email || renterEmail,
      };

      Object.keys(checkoutPayload).forEach(
        (k) => checkoutPayload[k] === undefined && delete checkoutPayload[k]
      );

      // Listeners
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
          // restore scroll after close
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
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
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
        });
      }

      // Prevent page scroll under modal (iOS)
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      // Launch and nudge visibility a few times so the iframe is never hidden
      window.CinetPay.getCheckout(checkoutPayload);
      nudgeModalVisibility();
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

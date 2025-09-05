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

export default function PayRentButton({
  unitCode,
  period,
  label = "Pay rent",
  channels = "ALL", // 'ALL' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'WALLET'
  className = "",
  onAccepted,
  onRefused,
  onClosed,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef(null);

  const safePeriod = useMemo(() => {
    if (period && Number(period.year) && Number(period.month)) return period;
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, [period]);

  const body = useMemo(() => ({ unitCode, period: safePeriod }), [unitCode, safePeriod]);

  const startCheckout = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      // CRA env only (avoid import.meta)
      const API_BASE =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_API_URL || // fallback to your existing env
        "";
      // 1) Ask your backend to init a CinetPay transaction
      const res = await fetch(`${API_BASE}/api/loye/payments/cinetpay/init-seamless`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to initialize payment");
      responseRef.current = data;

      // 2) Ensure SDK is loaded
      await loadCinetPayScript();
      if (!window.CinetPay) throw new Error("CinetPay SDK not available");

      // 3) Configure Seamless
      window.CinetPay.setConfig({
        apikey: data.apikey,
        site_id: data.site_id,
        mode: data.mode || "TEST",
        notify_url: data.notify_url, // your backend webhook URL
      });

      // 4) Launch checkout
      window.CinetPay.getCheckout({
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        channels: channels || data.channels || "ALL",
        description: data.description,
        lang: data.lang || "fr",
      });

      // 5) Listen for client-side result (authoritative status comes from your webhook)
      window.CinetPay.waitResponse((resp) => {
        if (resp?.status === "ACCEPTED") onAccepted?.(resp);
        else if (resp?.status === "REFUSED") onRefused?.(resp);
        // Final truth will be set by your backend webhook + /v2/payment/check
      });

      // Optional listeners
      if (window.CinetPay.onError) {
        window.CinetPay.onError((err) => {
          console.error("CinetPay error:", err);
          setError("Payment error. Please try again.");
        });
      }
      if (window.CinetPay.onClose) {
        window.CinetPay.onClose(() => {
          onClosed?.();
        });
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [body, channels, onAccepted, onClosed, onRefused]);

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
        {loading ? "Launching checkout…" : label}
      </button>

      {error ? (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {/* Optional debug: shows backend response in dev */}
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

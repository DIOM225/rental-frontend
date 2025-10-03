// client/src/components/PayRentButton.jsx
import React, { useState } from "react";

export default function PayRentButton({
  unitCode,
  amountXof,
  period,
  renterName,
  renterEmail,
  renterPhone, // ✅ NEW
  label = "Payer le loyer",
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startRedirect = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/loye/payments/cinetpay/init-redirect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitCode,
            amount: amountXof,
            period,
            renterName,
            renterEmail,
            renterPhone, // ✅ include phone in request body
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.ok && data.payment_url) {
        // ⏩ Redirect user to CinetPay payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <button
        type="button"
        onClick={startRedirect}
        disabled={loading}
        style={{
          backgroundColor: "#10b981", // green
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontWeight: 700,
          fontSize: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "opacity 0.2s ease",
        }}
      >
        {loading ? "Redirection..." : label}
      </button>

      {error && (
        <div
          style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "4px" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

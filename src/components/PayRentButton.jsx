// client/src/components/PayRentButton.jsx
import React, { useState } from "react";

export default function PayRentButton({
  unitCode,
  amountXof,
  period,
  renterName,
  renterEmail,
  renterPhone, // ✅ still passed
  label = "Payer le loyer",
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle Wave payment instead of CinetPay
  const startRedirect = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        unitCode,
        amount: amountXof,
        renterPhone,
      };

      console.log("📤 Sending Wave payload:", payload);

      // ✅ Call your Wave API route
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/loye/payments/wave/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        // ⏩ Redirect user to Wave checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error?.message || "Échec de la génération du paiement Wave.");
      }
    } catch (err) {
      console.error("Wave payment error:", err);
      setError(err.message || "Erreur inconnue");
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

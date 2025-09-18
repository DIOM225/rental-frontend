// client/src/components/PayRentButton.jsx
import React, { useState } from "react";

export default function PayRentButton({
  unitCode,
  amountXof,
  period,
  renterName,
  renterEmail,
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
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={startRedirect}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white shadow ${
          loading ? "opacity-50 cursor-wait" : "hover:opacity-90"
        }`}
        style={{ background: "#10b981" }}
      >
        {loading ? "Redirection..." : label}
      </button>

      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}

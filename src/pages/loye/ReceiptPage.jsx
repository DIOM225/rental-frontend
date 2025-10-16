// client/src/pages/loye/ReceiptPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch payment info
  useEffect(() => {
    async function fetchData() {
      try {
        const urlParams = new URLSearchParams(location.search);

        // ✅ Try to read both ?id= and ?tx= from URL
        const paymentId = id || urlParams.get("id") || urlParams.get("tx");
        if (!paymentId) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`/api/loye/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPayment(res.data);
      } catch (err) {
        console.error("Erreur de récupération du reçu :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, location.search]);

  // ✅ Download receipt as PDF
  const downloadPDF = async () => {
    const element = document.getElementById("receipt-container");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Recu-${payment?._id || "Paiement"}.pdf`);
  };

  // ✅ Handle loading and missing receipt
  if (loading) return <div style={styles.center}>Chargement du reçu...</div>;

  if (!payment)
    return (
      <div style={styles.center}>
        <h3>Aucun reçu trouvé</h3>
        <button onClick={() => navigate("/loye/dashboard")} style={styles.btn}>
          Retour au tableau de bord
        </button>
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <div id="receipt-container" style={styles.card}>
        <h2 style={styles.title}>🧾 Reçu de paiement</h2>

        <div style={styles.section}>
          <strong>Numéro de reçu :</strong> {payment._id || payment.transactionId}
        </div>
        <div style={styles.section}>
          <strong>Date :</strong>{" "}
          {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
        </div>
        <div style={styles.section}>
          <strong>Montant payé :</strong>{" "}
          {Number(payment.netAmount || payment.amount).toLocaleString("fr-FR")}{" "}
          FCFA
        </div>
        <div style={styles.section}>
          <strong>Code logement :</strong> {payment.unitCode}
        </div>
        <div style={styles.section}>
          <strong>Méthode :</strong> {payment.provider}
        </div>
        <div style={styles.section}>
          <strong>Statut :</strong>{" "}
          <span style={{ color: "#059669", fontWeight: 600 }}>Payé ✅</span>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={downloadPDF} style={styles.btn}>
          Télécharger le PDF
        </button>
        <button
          onClick={() => navigate("/loye/dashboard")}
          style={{ ...styles.btn, background: "#f97316" }}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}

// ✅ Responsive styles
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    padding: "clamp(1rem, 5vw, 2rem)",
  },
  card: {
    background: "#fff",
    padding: "clamp(1rem, 4vw, 2rem)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "500px",
    wordWrap: "break-word",
  },
  title: {
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
  },
  section: {
    margin: "8px 0",
    fontSize: "clamp(0.9rem, 3vw, 1rem)",
    lineHeight: 1.4,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.8rem",
    marginTop: "1.5rem",
  },
  btn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1rem",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(0.9rem, 3vw, 1rem)",
    flex: "1 1 auto",
    minWidth: "150px",
  },
  center: {
    textAlign: "center",
    padding: "2rem",
    fontSize: "clamp(1rem, 4vw, 1.2rem)",
  },
};

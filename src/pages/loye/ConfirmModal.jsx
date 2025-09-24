import React from 'react';

export default function ConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Confirmer les modifications</h3>
        <p>Les changements apportés seront visibles par le locataire. Souhaitez-vous continuer ?</p>
        <div style={styles.actions}>
          <button style={styles.cancel} onClick={onCancel}>Annuler</button>
          <button style={styles.confirm} onClick={onConfirm}>Oui, enregistrer</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancel: {
    background: '#e5e7eb',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  confirm: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
  }
};

import React from 'react';

function PropertyHeader({ property, onBack }) {
  return (
    <div style={styles.headerBand}>
      <div style={styles.headerInner}>
        <button onClick={onBack} style={styles.backBtnDark}>
          ← Retour aux propriétés
        </button>
        <h1 style={styles.title}>{property.name}</h1>
        <p style={styles.addressLine}>{property.address}</p>
      </div>
    </div>
  );
}

const styles = {
  headerBand: {
    background: 'linear-gradient(135deg, #0b1220 0%, #0e1a34 100%)',
    color: '#fff',
  },
  headerInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '24px',
  },
  backBtnDark: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  title: {
    margin: '12px 0 4px',
    fontSize: 32,
    fontWeight: 900,
  },
  addressLine: {
    margin: 0,
    opacity: 0.9,
  },
};

export default PropertyHeader;

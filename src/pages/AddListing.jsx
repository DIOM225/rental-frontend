// src/pages/AddListing.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import axios from '../utils/axiosInstance';
import axiosBase from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const normalizeType = (raw) => (raw === 'daily' || raw === 'monthly' ? raw : 'monthly');

function AddListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabType = useMemo(() => normalizeType(searchParams.get('type')), [searchParams]);

  // ---------- form state ----------
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState(tabType); // controlled by tabs
  const [pieces, setPieces] = useState('');
  const [images, setImages] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPhoneOnFile, setHasPhoneOnFile] = useState(false);
  const [discountPrice, setDiscountPrice] = useState('');
  const [isApproved, setIsApproved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setType(tabType);
  }, [tabType]);

  // Auth + phone preload
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsApproved(res.data.approved);
        if (res.data.phone) {
          setPhone(res.data.phone.replace('+225', ''));
          setHasPhoneOnFile(true);
        }
      } catch (err) {
        console.error('Erreur récupération utilisateur :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'diom_unsigned');
    const res = await axiosBase.post(
      'https://api.cloudinary.com/v1_1/dgpzat6o4/image/upload',
      formData
    );
    return res.data.secure_url;
  };

  // Tabs
  const switchTab = (next) => {
    const val = normalizeType(next);
    setSearchParams({ type: val }, { replace: true });
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!title.trim()) return alert('Le titre est requis.');
    if (!price || Number(price) <= 0) return alert('Le prix doit être supérieur à 0.');
    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return alert('Le prix remisé doit être inférieur au prix.');
    }
    if (!pieces) return alert('Le nombre de pièces est requis.');
    if (!city.trim()) return alert('La ville est requise.');
    if (!hasPhoneOnFile && !phone.trim()) return alert('Le numéro de téléphone est requis.');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 8 && digits.length !== 10) {
      return alert('Le téléphone doit contenir 8 ou 10 chiffres.');
    }
    if (images.length === 0) return alert('Veuillez ajouter au moins une image.');

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      // Put chosen thumbnail first
      const reordered = [
        images[thumbnailIndex],
        ...images.filter((_, idx) => idx !== thumbnailIndex),
      ];
      const uploadedImageUrls = await Promise.all(
        reordered.map((file) => uploadImageToCloudinary(file))
      );

      const newListing = {
        title: title.trim(),
        address: address.trim(),
        city: city.trim(),
        commune: commune.trim(),
        type, // "monthly" | "daily"
        pieces,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        images: uploadedImageUrls, // first is thumbnail
        description: description.trim(),
        phone: `+225${digits}`,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/listings`, newListing, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Annonce ajoutée avec succès !');
      navigate('/my-listings');
    } catch (error) {
      console.error('❌ Erreur création annonce:', error);
      alert("Erreur lors de l'ajout de l'annonce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!isApproved) {
    navigate('/request-host');
    return null;
  }

  const priceLabel = type === 'monthly' ? 'Prix mensuel (FCFA)' : 'Prix par nuit (FCFA)';
  const pricePlaceholder = type === 'monthly' ? 'Ex. 150000' : 'Ex. 25000';

  // ARIA IDs
  const tabMonthlyId = 'tab-monthly';
  const tabDailyId = 'tab-daily';
  const panelMonthlyId = 'panel-monthly';
  const panelDailyId = 'panel-daily';

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.h1}>Ajouter une annonce</h1>

        {/* Tabs */}
        <div role="tablist" aria-label="Type d'annonce" style={styles.tabs}>
          <button
            id={tabMonthlyId}
            role="tab"
            aria-selected={type === 'monthly'}
            aria-controls={panelMonthlyId}
            onClick={() => switchTab('monthly')}
            style={{ ...styles.tab, ...(type === 'monthly' ? styles.tabActive : {}) }}
            type="button"
          >
            Mensuel
          </button>
          <button
            id={tabDailyId}
            role="tab"
            aria-selected={type === 'daily'}
            aria-controls={panelDailyId}
            onClick={() => switchTab('daily')}
            style={{ ...styles.tab, ...(type === 'daily' ? styles.tabActive : {}) }}
            type="button"
          >
            Journalier
          </button>
        </div>

        {/* Panel wrapper (single form; labels adapt by tab) */}
        <div
          role="tabpanel"
          id={type === 'monthly' ? panelMonthlyId : panelDailyId}
          aria-labelledby={type === 'monthly' ? tabMonthlyId : tabDailyId}
        >
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Infos principales */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Infos principales</h2>
              <div style={styles.stack}>
                <label style={styles.label}>Titre</label>
                <input
                  type="text"
                  placeholder="Ex. Bel appartement lumineux à Cocody"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.grid2}>
                <div style={styles.stack}>
                  <label style={styles.label}>{priceLabel}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={pricePlaceholder}
                    value={price}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setPrice(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.stack}>
                  <label style={styles.label}>Prix remisé (facultatif)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex. 120000"
                    value={discountPrice}
                    onChange={(e) =>
                      /^\d*$/.test(e.target.value) && setDiscountPrice(e.target.value)
                    }
                    style={styles.input}
                  />
                  <p style={styles.hint}>
                    Affiche le prix initial barré et le prix remisé en vert.
                  </p>
                </div>
              </div>

              <div style={styles.stack}>
                <label style={styles.label}>Nombre de pièces</label>
                <select
                  value={pieces}
                  onChange={(e) => setPieces(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Studio">Studio</option>
                  <option value="1 Pièce">1 Pièce</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>
            </section>

            {/* Localisation */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Localisation</h2>
              <div style={styles.stack}>
                <label style={styles.label}>Adresse</label>
                <input
                  type="text"
                  placeholder="Rue, immeuble, étage…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.grid2}>
                <div style={styles.stack}>
                  <label style={styles.label}>Ville</label>
                  <input
                    type="text"
                    placeholder="Ex. Abidjan"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.stack}>
                  <label style={styles.label}>Commune (facultatif)</label>
                  <input
                    type="text"
                    placeholder="Ex. Cocody"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </section>

            {/* Contact */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Contact</h2>
              <div style={styles.stack}>
                <label style={styles.label}>Téléphone</label>
                {hasPhoneOnFile ? (
                  <input
                    type="text"
                    value={`+225${phone}`}
                    disabled
                    style={{ ...styles.input, backgroundColor: '#f5f7fb' }}
                  />
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="+225…"
                    value={phone}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setPhone(e.target.value)}
                    style={styles.input}
                    required
                  />
                )}
              </div>
            </section>

            {/* Description */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Description</h2>
              <div style={styles.stack}>
                <label style={styles.label}>Description détaillée du logement (facultatif)</label>
                <textarea
                  placeholder="Description détaillée du logement…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>
            </section>

            {/* Photos */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Photos</h2>
              <div style={styles.stack}>
                <label style={styles.label}>Uploader des photos</label>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.dropzone}
                >
                  <div style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }}>⤒</div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Glissez-déposez vos photos ici</p>
                  <p style={{ margin: '6px 0 12px', color: '#6b7280' }}>
                    ou cliquez pour sélectionner
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={styles.smallBtn}
                  >
                    Choisir des fichiers
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setImages((prev) => [...prev, ...files]);
                    }}
                  />
                </div>

                <p style={styles.hint}>Au moins 1 photo (JPG/PNG/WebP, max 10MB par fichier)</p>

                {images.length > 0 && (
                  <div style={styles.previewGrid}>
                    {images.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.previewWrapper,
                          border: idx === thumbnailIndex ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        }}
                        title={idx === thumbnailIndex ? 'Image principale' : 'Définir comme principale'}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview ${idx}`}
                          style={styles.previewImage}
                          onClick={() => setThumbnailIndex(idx)}
                        />
                        {idx === thumbnailIndex && <div style={styles.thumbnailTag}>Miniature</div>}
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => prev.filter((_, i) => i !== idx));
                            if (idx === thumbnailIndex) setThumbnailIndex(0);
                            else if (idx < thumbnailIndex)
                              setThumbnailIndex((prev) => Math.max(0, prev - 1));
                          }}
                          style={styles.deleteButton}
                          aria-label="Supprimer l'image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <button type="submit" style={styles.submit} disabled={isSubmitting}>
              {isSubmitting ? <div style={spinnerStyle} /> : 'Ajouter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- styles (simple, sectioned, clean) ---------- */
const styles = {
  page: { background: '#f8fafc', minHeight: '100vh', padding: '24px 12px' },
  shell: {
    maxWidth: 760,
    margin: '0 auto',
    background: 'transparent',
  },
  h1: {
    textAlign: 'center',
    margin: '0 0 20px',
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    background: '#eef2f7',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    height: 42,
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#475569',
  },
  tabActive: {
    background: '#ffffff',
    boxShadow: '0 1px 0 0 #e5e7eb, inset 0 0 0 1.5px #c7d2fe',
    color: '#0f172a',
  },
  form: { display: 'grid', gap: 14 },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px',
  },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
  },
  stack: { display: 'grid', gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: '#334155' },
  input: {
    height: 44,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0 12px',
    fontSize: 15,
    outline: 'none',
  },
  hint: { color: '#64748b', fontSize: 12, marginTop: 4 },
  dropzone: {
    border: '2px dashed rgba(100,116,139,0.35)',
    borderRadius: 12,
    textAlign: 'center',
    padding: '28px 16px',
    cursor: 'pointer',
    background: '#fbfdff',
  },
  smallBtn: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: 8,
    padding: '8px 12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 88px)', gap: 10 },
  previewWrapper: { position: 'relative', borderRadius: 8, overflow: 'hidden' },
  previewImage: { width: 88, height: 88, objectFit: 'cover', display: 'block' },
  thumbnailTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#fde68a',
    color: '#78350f',
    fontSize: 12,
    textAlign: 'center',
    padding: '2px 0',
    fontWeight: 700,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 20,
    height: 20,
    fontSize: 14,
    lineHeight: '20px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  submit: {
    height: 50,
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 800,
    color: '#fff',
    cursor: 'pointer',
    background: 'linear-gradient(90deg,#2563eb 0%, #3b82f6 100%)',
    boxShadow: '0 8px 20px rgba(59,130,246,0.25)',
  },
};

// spinner
const spinnerStyle = {
  width: 22,
  height: 22,
  border: '3px solid white',
  borderTop: '3px solid #007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

if (typeof document !== 'undefined' && !document.getElementById('spinner-style')) {
  const style = document.createElement('style');
  style.id = 'spinner-style';
  style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @media (min-width: 760px) {
      /* make price/discount and city/commune two columns on larger screens */
      .grid2-lg { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    }
  `;
  document.head.appendChild(style);
}

export default AddListing;

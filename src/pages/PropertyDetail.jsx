import React, { Suspense, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { FaStar } from 'react-icons/fa';
import 'yet-another-react-lightbox/styles.css';
import './PropertyDetail.css';

const Lightbox = React.lazy(() => import('yet-another-react-lightbox'));

function PropertyDetail({ isAdminPreview = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [editableProperty, setEditableProperty] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const optimizeImage = useCallback((src, w, h) => {
    if (!src) return '';
    return src.includes('/upload/')
      ? src.replace('/upload/', `/upload/w_${w},h_${h},c_fill/`)
      : src;
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditableProperty((prev) => ({ ...prev, [field]: value }));
  }, []);

  const trackClick = useCallback(async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/listings/${id}/contact-click`);
    } catch (err) {
      console.error('❌ Failed to track contact click:', err);
    }
  }, [id]);

  const openWhatsApp = useCallback(() => {
    trackClick();
    const adminNumber = process.env.REACT_APP_ADMIN_WHATSAPP || '2250745123456';
    const sanitized = adminNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Bonjour 👋, je suis intéressé par ce logement : ${window.location.href}`);
    window.open(`https://wa.me/${sanitized}?text=${message}`, '_blank');

  }, [trackClick]);

  const openLightbox = useCallback((index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Vous devez être connecté pour voir les détails.');
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    const endpoint = isAdminPreview
      ? `${process.env.REACT_APP_API_URL}/api/admin/listings/${id}`
      : `${process.env.REACT_APP_API_URL}/api/listings/${id}`;

    axios
      .get(endpoint, {
        headers: isAdminPreview ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
      })
      .then((res) => {
        setProperty(res.data);
        if (isAdminPreview) setEditableProperty(res.data);
      })
      .catch((err) => {
        console.error('❌ Error fetching property:', err);
      });
  }, [id, isAdminPreview]);

  if (!property) return <p className="center-text">Chargement...</p>;

  const data = isAdminPreview ? editableProperty : property;
  const images = data.images?.length ? data.images : [data.image];
  const avgRating = data.reviews?.length
    ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
    : 0;

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/listings/${id}`, editableProperty, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Changes saved successfully!');
      setProperty(editableProperty);
    } catch (err) {
      console.error('❌ Failed to save changes:', err);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = () => {
    if (!selectedRating) {
      alert('Veuillez sélectionner une note!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour laisser une note.');
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/listings/${id}/reviews`,
        { rating: selectedRating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        alert('Merci pour votre note!');
        setProperty(res.data);
        setSelectedRating(0);
      })
      .catch((err) => {
        console.error('❌ Error submitting review:', err);
        alert('Erreur lors de la soumission.');
      });
  };

  return (
    <div className="property-page">
      {isAdminPreview ? (
        <div className="admin-image-grid">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={optimizeImage(img, 200, 130)}
              className="admin-image-thumb"
              width={200}
              height={130}
              onClick={() => openLightbox(idx)}
              alt={`View ${idx + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <div className="property-gallery">
          <img
            src={optimizeImage(images[0], 800, 500)}
            srcSet={`
              ${optimizeImage(images[0], 400, 250)} 400w,
              ${optimizeImage(images[0], 800, 500)} 800w,
              ${optimizeImage(images[0], 1200, 750)} 1200w
            `}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
            alt="Main"
            className="thumbnail-image"
            onClick={() => openLightbox(0)}
            width={800}
            height={500}
            loading="eager"
          />
          <div className="side-images">
            {images.slice(1, 3).map((img, idx) => (
              <img
                key={idx + 1}
                src={optimizeImage(img, 400, 250)}
                width={400}
                height={250}
                alt={`View ${idx + 1}`}
                className="side-thumb"
                onClick={() => openLightbox(idx + 1)}
                loading="lazy"
              />
            ))}
            {images.length > 3 && (
              <div className="more-images" onClick={() => openLightbox(3)}>
                <img
                  src={optimizeImage(images[3], 400, 250)}
                  width={400}
                  height={250}
                  alt="More"
                  className="side-thumb"
                  loading="lazy"
                />
                <div className="overlay">+{images.length - 3}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="property-header">
        {isAdminPreview ? (
          <>
            <input value={data.title} onChange={(e) => handleInputChange('title', e.target.value)} className="editable-input" />
            <input value={data.address} onChange={(e) => handleInputChange('address', e.target.value)} className="editable-input" />
            <input value={data.city} onChange={(e) => handleInputChange('city', e.target.value)} className="editable-input" />
            <input value={data.commune} onChange={(e) => handleInputChange('commune', e.target.value)} className="editable-input" />
            <input value={data.price} onChange={(e) => handleInputChange('price', e.target.value)} className="editable-input" />
            <select value={data.type} onChange={(e) => handleInputChange('type', e.target.value)} className="editable-input">
              <option value="monthly">Location Mensuelle</option>
              <option value="daily">Location Journalière</option>
            </select>
          </>
        ) : (
          <>
            <h1 className="property-title">{data.title}</h1>
            <p className="property-location">
              {data.address} – {data.city} {data.commune && `, ${data.commune}`}
            </p>
            <p className="property-type">{data.type === 'monthly' ? 'Location Mensuelle' : 'Location Journalière'}</p>
            <p className="property-price">{data.price.toLocaleString()} FCFA {data.type === 'monthly' ? '/ mois' : '/ jour'}</p>
          </>
        )}

        <div className="property-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} color={i < Math.round(avgRating) ? '#ffc107' : '#ccc'} />
          ))}
          <span className="property-review-count">({data.reviews?.length || 0} avis)</span>
        </div>
      </div>

      {data.description && (
        <div className="property-description">
          <h3>Description</h3>
          {isAdminPreview ? (
            <textarea value={data.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} style={{ width: '100%' }} />
          ) : (
            <div style={{ whiteSpace: 'pre-line' }}>{data.description}</div>
          )}
        </div>
      )}

      {isAdminPreview && data.phone && (
        <p className="host-number">📞 Numéro de l’hôte : {data.phone}</p>
      )}

      {!isAdminPreview && (
        <button onClick={openWhatsApp} className="property-button">
          📱 Contacter le service client sur WhatsApp
        </button>
      )}

      {!isAdminPreview && (
        <div className="review-form">
          <h3>Laisser une note</h3>
          <div className="review-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <FaStar
                key={i}
                size={30}
                style={{ cursor: 'pointer' }}
                color={i < selectedRating ? '#ffc107' : '#ccc'}
                onClick={() => setSelectedRating(i + 1)}
              />
            ))}
          </div>
          <button className="review-button" onClick={handleSubmitReview}>Envoyer</button>
        </div>
      )}

      {isAdminPreview && (
        <button className="property-button" onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : '✅ Enregistrer les modifications'}
        </button>
      )}

      {lightboxOpen && (
        <Suspense fallback={<div>Chargement de la galerie...</div>}>
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={images.map((img) => ({ src: optimizeImage(img, 1024, 768) }))}
            index={photoIndex}
            on={{ view: ({ index }) => setPhotoIndex(index) }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default PropertyDetail;

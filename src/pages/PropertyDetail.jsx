import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa6';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './PropertyDetail.css';

function PropertyDetail({ isAdminPreview = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [editableProperty, setEditableProperty] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
      ? `http://localhost:5050/api/admin/listings/${id}`
      : `http://localhost:5050/api/listings/${id}`;

    axios
      .get(endpoint, {
        headers: isAdminPreview
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {},
      })
      .then((res) => {
        setProperty(res.data);
        if (isAdminPreview) {
          setEditableProperty(res.data);
        }
      })
      .catch((err) => {
        console.error('❌ Error fetching property:', err);
      });
  }, [id, isAdminPreview]);

  const handleInputChange = (field, value) => {
    setEditableProperty((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5050/api/listings/${id}`, editableProperty, {
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

    axios
      .post(`http://localhost:5050/api/listings/${id}/reviews`, { rating: selectedRating })
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

  const trackClick = async () => {
    try {
      await axios.post(`http://localhost:5050/api/listings/${id}/contact-click`);
    } catch (err) {
      console.error('❌ Failed to track contact click:', err);
    }
  };

  const openWhatsApp = () => {
    trackClick();
    const fullNumber = property.phone;
    window.open(`https://wa.me/+225${fullNumber}`, '_blank');
  };

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  if (!property) return <p className="center-text">Chargement...</p>;

  const data = isAdminPreview ? editableProperty : property;
  const images = data.images?.length ? data.images : [data.image];
  const avgRating = data.reviews?.length
    ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
    : 0;

  return (
    <div className="property-page">
      {isAdminPreview ? (
        <div className="admin-image-grid">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              className="admin-image-thumb"
              onClick={() => openLightbox(idx)}
              alt={`View ${idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="property-gallery">
          <img
            src={images[0]}
            alt="Main"
            className="thumbnail-image"
            onClick={() => openLightbox(0)}
          />
          <div className="side-images">
            {images.slice(1, 3).map((img, idx) => (
              <img
                key={idx + 1}
                src={img}
                alt={`View ${idx + 1}`}
                onClick={() => openLightbox(idx + 1)}
                className="side-thumb"
              />
            ))}
            {images.length > 3 && (
              <div className="more-images" onClick={() => openLightbox(3)}>
                <img src={images[3]} alt="More" className="side-thumb" />
                <div className="overlay">+{images.length - 3}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="property-header">
        {isAdminPreview ? (
          <>
            <input name="title" value={data.title} onChange={(e) => handleInputChange('title', e.target.value)} className="editable-input" />
            <input name="address" value={data.address} onChange={(e) => handleInputChange('address', e.target.value)} className="editable-input" />
            <input name="city" value={data.city} onChange={(e) => handleInputChange('city', e.target.value)} className="editable-input" />
            <input name="commune" value={data.commune} onChange={(e) => handleInputChange('commune', e.target.value)} className="editable-input" />
            <input name="price" value={data.price} onChange={(e) => handleInputChange('price', e.target.value)} className="editable-input" />
            <select name="type" value={data.type} onChange={(e) => handleInputChange('type', e.target.value)} className="editable-input">
              <option value="monthly">Location Mensuelle</option>
              <option value="daily">Location Journalière</option>
            </select>
          </>
        ) : (
          <>
            <h1 className="property-title">{data.title}</h1>
            <p className="property-location">{data.address} – {data.city} {data.commune && `, ${data.commune}`}</p>
            <p className="property-type">{data.type === 'monthly' ? 'Location Mensuelle' : 'Location Journalière'}</p>
            <p className="property-price">${data.price} {data.type === 'monthly' ? '/ mois' : '/ jour'}</p>
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
            <textarea name="description" value={data.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} style={{ width: '100%' }} />
          ) : (
            <div style={{ whiteSpace: 'pre-line' }}>{data.description}</div>
          )}
        </div>
      )}

      {!isAdminPreview && data.phone && (
        <button onClick={openWhatsApp} className="property-button">
          📱 Contacter l’hôte sur WhatsApp
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

      {/* ✅ Modern Lightbox Without Modal Error */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((img) => ({ src: img }))}
        index={photoIndex}
        on={{ view: ({ index }) => setPhotoIndex(index) }}
      />
    </div>
  );
}

export default PropertyDetail;

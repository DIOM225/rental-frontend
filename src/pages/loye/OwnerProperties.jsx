// 📄 src/pages/loye/OwnerProperties.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({ name: '', address: '', rent: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('loyeToken');

  const fetchProperties = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/loye/properties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(res.data);
    } catch (err) {
      setError('Failed to load properties');
    }
  }, [token]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleChange = (e) => {
    setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5050/api/loye/properties', newProperty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Property added!');
      setNewProperty({ name: '', address: '', rent: '' });
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding property');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🏘 My Properties</h2>

      {/* Add Property Form */}
      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          name="name"
          placeholder="Property name"
          value={newProperty.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={newProperty.address}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="rent"
          placeholder="Monthly rent"
          value={newProperty.rent}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Add Property</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Display Properties */}
      <ul>
        {properties.map((property) => (
          <li key={property._id} style={propertyStyle}>
            <strong>{property.name}</strong><br />
            📍 {property.address} <br />
            💰 {property.rent} CFA / month
          </li>
        ))}
      </ul>
    </div>
  );
}

const inputStyle = {
  display: 'block',
  marginBottom: '1rem',
  padding: '0.6rem',
  width: '100%',
  maxWidth: '400px',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  padding: '0.6rem 1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const propertyStyle = {
  marginBottom: '1rem',
  padding: '1rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

export default OwnerProperties;

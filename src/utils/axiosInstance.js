// 📄 client/src/utils/axiosInstance.js
import axios from 'axios';
// Optional: If you’re using toast notifications
// import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://rental-backend-uqo8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Global token expiration handler
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional toast
      // toast.error('Session expirée. Veuillez vous reconnecter.');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Slight delay to show message if needed
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default instance;

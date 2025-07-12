// client/src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://rental-backend-uqo8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login if token is expired or invalid
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;

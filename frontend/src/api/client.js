import axios from 'axios';

// In dev, Vite proxies /api -> http://localhost:4000 (see vite.config.js),
// so this works with zero environment configuration.
const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fairshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('fairshare_token');
      localStorage.removeItem('fairshare_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Small helper: pull a readable message out of any axios error shape.
export function errorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error || err?.message || fallback;
}

export default client;

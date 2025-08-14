import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

let R = false;
api.interceptors.response.use(
  r => r,
  e => {
    if (e?.response?.status === 401 && !R) {
      R = true;
      localStorage.removeItem('token');
      window.location.assign('/login');
      setTimeout(() => R = false, 1200);
    }
    return Promise.reject(e);
  }
);

export default api;

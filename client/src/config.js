// Central API configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper for authenticated requests
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
};

export default API_BASE;

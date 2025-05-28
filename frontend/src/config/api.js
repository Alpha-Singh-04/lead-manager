// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://lead-manager-g8m6.onrender.com';
export const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000';

// Simple function to get the current API URL
export const getCurrentApiUrl = () => {
  return localStorage.getItem('useLocalApi') === 'true' ? LOCAL_API_URL : API_URL;
};

// Function to toggle between local and production API
export const toggleApiUrl = () => {
  const current = localStorage.getItem('useLocalApi') === 'true';
  localStorage.setItem('useLocalApi', !current);
  window.location.reload();
};

export default {
  baseURL: getCurrentApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
}; 
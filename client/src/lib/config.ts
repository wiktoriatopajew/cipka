// API Configuration for different environments
const getApiBaseUrl = () => {
  // In production on Vercel, use the current domain
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('API_BASE_URL:', API_BASE_URL);
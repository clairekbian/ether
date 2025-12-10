import axios from 'axios';

// API Configuration - use environment variable or fallback
const API_URL = process.env.REACT_APP_API_URL || 'https://ether-backend.onrender.com';

console.log('API URL configured:', API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Also configure the default axios instance
axios.defaults.baseURL = API_URL;

export default api;


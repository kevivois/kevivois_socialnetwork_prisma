import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL,
  withCredentials: true, // Allow cookies to be sent and received
});

export default api;
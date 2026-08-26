import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const API = axios.create({
  baseURL: API_URL,
});

// Helper function:wait unlit firebase load user
const waitForAuthUser = (auth) => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      return resolve(auth.currentUser);
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Request Interceptor
API.interceptors.request.use(async (config) => {
  const auth = getAuth();
  
  try {
    const user = await waitForAuthUser(auth);
    if (user) {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached successfully for:", user.email);
    } else {
      console.warn("No user found even after waiting!");
    }
  } catch (err) {
    console.error("Error in auth interceptor:", err);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadYoutubeVideo = async (url) => {
  return API.post('/upload/youtube', { url });
};

export const searchVideo = async (query, top_k = 5) => {
  return API.post('/search', { query, top_k, min_score: 0.2 });
};

export const getStats = async () => {
  return API.get('/history/stats');
};

export const getHistory = async () => {
  return API.get('/history');
};
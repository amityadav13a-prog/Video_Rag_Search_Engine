import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const uploadVideo = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadYoutubeVideo = (url) => {
  return axios.post(`${API_URL}/upload/youtube`, { url });
};

export const searchVideo = (query, top_k = 5) => {
  return axios.post(`${API_URL}/search`, { query, top_k, min_score: 0.2 });
};

export const getStats = () => axios.get(`${API_URL}/stats`);
export const getHistory = () => axios.get(`${API_URL}/history`);
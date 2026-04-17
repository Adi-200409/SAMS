// Central API configuration — change BASE_URL to your local IP for Expo Go on physical device
// For Android Emulator: http://10.0.2.2:8000
// For iOS Simulator: http://localhost:8000
// For physical device: http://YOUR_LOCAL_IP:8000 (e.g. http://192.168.1.5:8000)

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://10.55.44.147:8000'; // Auto-detected local IP
export const API_URL = `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        await SecureStore.setItemAsync('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

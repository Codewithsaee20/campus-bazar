import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

let refreshPromise = null;

const getStoredToken = () => {
  const tokenFromStore = useAuthStore.getState().token;
  if (tokenFromStore) return tokenFromStore;

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) return null;

  try {
    const { state } = JSON.parse(authStorage);
    return state?.token || null;
  } catch {
    return null;
  }
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const payload = response?.data?.data || response?.data || {};
        const accessToken = payload?.accessToken || payload?.token;

        if (!accessToken) {
          throw new Error('Refresh endpoint did not return a token.');
        }

        const existingUser = useAuthStore.getState().user;
        const user = payload?.user || existingUser;
        useAuthStore.getState().setAuth(user, accessToken);

        return accessToken;
      })
      .catch((error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          useAuthStore.getState().logout();
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;

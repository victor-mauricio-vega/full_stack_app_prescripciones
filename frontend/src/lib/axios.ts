import axios from "axios";
import { useAuthStore } from "@/src/store/auth.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});


// Adjunta accessToken a cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresca el token si recibe 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!original) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { refreshToken, user } = useAuthStore.getState();

        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        useAuthStore
          .getState()
          .setAuth(user!, data.accessToken, data.refreshToken);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        useAuthStore.getState().clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

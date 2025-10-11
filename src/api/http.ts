import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // if your backend sets cookies (optional)
});

// attach auth token from store if present
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem("persist:root");
  if (raw) {
    const root = JSON.parse(raw);
    const auth = root.auth ? JSON.parse(root.auth) : null;
    const token = auth?.serverToken as string | undefined;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

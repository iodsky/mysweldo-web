import axios from "axios";
import type { ApiError } from "@/types";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const client = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Single-flight refresh: concurrent 401s share one in-flight /auth/refresh call
// instead of each triggering its own.
let refreshPromise: Promise<void> | null = null;

export const refreshAccessToken = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = client
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

client.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Prevent infinite refresh loops - don't retry refresh endpoint itself
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        // Refresh tokens are httpOnly cookies; the new access token is also an
        // httpOnly cookie set by the server, so we only need to refresh and retry.
        await refreshAccessToken();
        return client(originalRequest); // Retry the original request with the new access token cookie.
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    const data = error.response?.data;

    if (
      typeof data === "object" &&
      typeof data.message === "string" &&
      typeof data.status === "number"
    ) {
      return Promise.reject(data);
    }

    // fallback: normalize unknown error into ApiError
    return Promise.reject<ApiError>({
      timestamp: new Date().toISOString(),
      status: error.response?.status ?? 0,
      message: error.message || "Unexpected error",
    });
  },
);

export default client;

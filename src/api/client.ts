import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite refresh loops - don't retry refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        // The refreshToken is sent automatically as an httpOnly cookie.
        const response = await client.post("/auth/refresh");
        const { token } = response.data;
        localStorage.setItem("token", token);
        return client(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default client;

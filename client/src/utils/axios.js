import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Send cookies like refresh token
});

// Attach access token from localStorage to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 'token' is access token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          "http://localhost:3000/user/refresh-token",
          {
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("No token in refresh response");

        localStorage.setItem("token", newAccessToken); // Store new token

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem("token");
        console.error("Refresh token failed:", refreshErr);
        // Redirect to login page or handle accordingly
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;

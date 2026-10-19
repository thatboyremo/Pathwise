import axios from "axios";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/?$/, "/");

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") {
      return config;
    }

    const requestUrl = config.url || "";

    const publicEndpoints = [
      "login/",
      "register/",
      "forgot-password/",
    ];

    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) => requestUrl.includes(endpoint)
    );

    const accessToken = localStorage.getItem("access");

    // =====================================================
    // DO NOT ATTACH JWT TO PUBLIC ENDPOINTS
    // =====================================================

    if (
      accessToken &&
      !isPublicEndpoint
    ) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

  (response) => {
    return response;
  },

  async (error) => {

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    // =====================================================
    // PUBLIC ENDPOINTS
    // =====================================================

    const publicEndpoints = [
      "login/",
      "register/",
      "forgot-password/",
      "logout/",
    ];

    const isPublicEndpoint =
      publicEndpoints.some(
        (endpoint) =>
          requestUrl.includes(endpoint)
      );

    // =====================================================
    // AUTHENTICATION FAILURE
    // =====================================================

    if (
      status === 401 &&
      !isPublicEndpoint
    ) {

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("first_name");
      localStorage.removeItem("last_name");
      localStorage.removeItem("email");
      localStorage.removeItem("profile");

      // ===================================================
      // REDIRECT
      // ===================================================

      if (
        window.location.pathname !==
        "/login"
      ) {

        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
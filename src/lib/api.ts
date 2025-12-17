import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  POINT_CLOUD: `${API_BASE_URL}/api/pointcloud`,
  SEGMENT: `${API_BASE_URL}/api/segment`,
} as const;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (로깅, 인증 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        console.error("Network error:", error.message);
      } else {
        console.error(
          `API error ${error.response.status}:`,
          error.response.data
        );
      }
    }
    return Promise.reject(error);
  }
);

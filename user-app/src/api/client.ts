// src/api/client.ts
import { BASE_URL } from "@/api";
import axios from "axios";


const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example response interceptor to unwrap data (optional)
// apiClient.interceptors.response.use(resp => resp.data, err => Promise.reject(err));

export default apiClient;

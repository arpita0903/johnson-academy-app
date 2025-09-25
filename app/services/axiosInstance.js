// api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config/environment";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
      }
    } catch (error) {
      // Silent error handling for production
      if (__DEV__) {
        console.error("Error fetching token for request:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

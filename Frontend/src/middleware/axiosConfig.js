import axios from "axios";
import { BACKEND_URL } from "../config/constants.js";

// Next we make an 'instance' of it
const instance = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true, // Tự động gửi cookies trong mọi request
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;

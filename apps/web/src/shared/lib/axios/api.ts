import { envConfig } from "@vetra/env/client-vite";
import axios from "axios";

const { VITE_API_URL } = envConfig.get();

const api = axios.create({
  baseURL: VITE_API_URL,
});

export default api;

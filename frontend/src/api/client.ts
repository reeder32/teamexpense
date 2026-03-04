import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3001/api",
});

client.interceptors.request.use((config) => {
  // BUG: Reads token from localStorage which is vulnerable to XSS attacks
  // Should use httpOnly cookies instead
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// BUG: No response interceptor to handle 401s — if the token expires,
// the user sees raw errors instead of being redirected to login
export default client;

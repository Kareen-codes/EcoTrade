// API Configuration - Centralized API URL management
// Uses environment variable for flexibility across environments

// Base API URL from environment or fallback to localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Socket.io server URL from environment or fallback to localhost
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Server base URL (for static files like images)
export const SERVER_URL = SOCKET_URL;

/**
 * Construct full API endpoint URL
 * @param {string} endpoint - API endpoint path (e.g., '/users/profile')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Construct full server URL for static files
 * @param {string} path - File path (e.g., 'uploads/image.jpg')
 * @returns {string} Full server URL
 */
export const getServerUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SERVER_URL}/${cleanPath}`;
};

const apiConfig = {
  API_BASE_URL,
  SOCKET_URL,
  SERVER_URL,
  getApiUrl,
  getServerUrl
};

export default apiConfig;

import axios from 'axios';

const API_URL = 'http://localhost:8070';

// Login function that handles authentication and token storage
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, { 
      email, 
      password 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      return { success: true, role: response.data.role };
    }
    
    return { success: false, message: 'No token received' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Authentication failed' 
    };
  }
};

// Logout function that removes tokens and user data
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  // Optional: Call logout endpoint to invalidate token on server
  const token = localStorage.getItem('token');
  if (token) {
    axios.post(`${API_URL}/users/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {}); // Ignore errors as we're logging out anyway
  }
};

// Validate the token on protected routes
export const validateToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false };
  
  try {
    const response = await axios.get(`${API_URL}/users/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { valid: true, user: response.data.user };
  } catch (error) {
    if (error.response?.data?.expired) {
      // Token expired, try to refresh it
      return refreshToken();
    }
    // Other errors, clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return { valid: false };
  }
};

// Refresh token when expired
export const refreshToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false };
  
  try {
    const response = await axios.post(`${API_URL}/users/refresh-token`, { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { valid: true };
    }
    return { valid: false };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return { valid: false };
  }
};

// Get current user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const result = await validateToken();
  return result.valid;
};

// Role based route guard
export const checkRoleAccess = async (allowedRoles) => {
  const result = await validateToken();
  if (!result.valid) return false;
  
  const role = localStorage.getItem('role');
  return allowedRoles.includes(role);
};

export default {
  loginUser,
  logoutUser,
  validateToken,
  refreshToken,
  getUserRole,
  isAuthenticated,
  checkRoleAccess
};

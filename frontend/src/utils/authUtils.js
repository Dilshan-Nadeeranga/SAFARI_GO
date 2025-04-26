/**
 * Utility functions for authentication-related operations
 */

// Check if user is authenticated (token exists)
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Authenticate axios request config with token
export const configureAuth = (config = {}) => {
  const token = getAuthToken();
  
  if (!token) return config;
  
  // Create headers if they don't exist
  const headers = { 
    ...(config.headers || {}),
    Authorization: `Bearer ${token}`
  };
  
  return { 
    ...config,
    headers 
  };
};

// Handle authentication errors
export const handleAuthError = (error, navigate) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token'); // Clear invalid token
    
    if (navigate) {
      // Get current path to redirect back after login
      const currentPath = window.location.pathname;
      navigate('/LoginForm', { state: { redirectTo: currentPath } });
    }
    return true; // Error was handled
  }
  return false; // Error wasn't an auth error
};

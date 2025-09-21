import apiInstance from '../api';

// Auth API endpoints
const AUTH_ENDPOINT = '/auth';

export const authAPI = {
  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/login`, credentials);
    return response.data;
  },

  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/register`, userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/logout`);
    return response.data;
  },

  // Check authentication status
  checkAuth: async () => {
    const response = await apiInstance.get(`${AUTH_ENDPOINT}/me`);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/refresh`);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/reset-password`, { token, password });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiInstance.post(`${AUTH_ENDPOINT}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authAPI;

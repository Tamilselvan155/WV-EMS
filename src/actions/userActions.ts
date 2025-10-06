import apiInstance from '../api';

const USERS_ENDPOINT = '/users';

export const userAPI = {
  getUsers: async (params: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
    const response = await apiInstance.get(`${USERS_ENDPOINT}/`, { params });
    return response.data;
  },
  createUser: async (userData: { firstName: string; lastName: string; email: string; password: string; role: string }) => {
    const response = await apiInstance.post(`${USERS_ENDPOINT}/`, userData);
    return response.data;
  },
  updateUser: async (id: string, userData: { firstName?: string; lastName?: string; email?: string; role?: string; password?: string }) => {
    const response = await apiInstance.put(`${USERS_ENDPOINT}/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await apiInstance.delete(`${USERS_ENDPOINT}/${id}`);
    return response.data;
  },
};



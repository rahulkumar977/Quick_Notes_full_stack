import apiClient from './api/axios';

export const adminApi = {
  // Admin Dashboard Statistics
  getAdminStats: async () => {
    const response = await apiClient.get('/dashboard/admin-stats');
    return response.data;
  },

  // Student Record Management
  getAllStudents: async (params = {}) => {
    const response = await apiClient.get('/auth/users', { params });
    return response.data;
  },

  toggleStudentStatus: async (id, isActive) => {
    const response = await apiClient.patch(`/auth/users/${id}/status`, { isActive });
    return response.data;
  },

  // Notes Repository Management
  getAllNotes: async (params = {}) => {
    const response = await apiClient.get('/notes/admin/all', { params });
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },

  updateNoteVisibility: async (id, visibility) => {
    const response = await apiClient.patch(`/notes/${id}`, { visibility });
    return response.data;
  }
};

export default adminApi;


import api from './client';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getFarms: () => api.get('/dashboard/farms'),
  getTrend: () => api.get('/dashboard/trend'),
};

export const farmAPI = {
  create: (data) => api.post('/farms', data),
  getAll: () => api.get('/farms'),
  get: (id) => api.get(`/farms/${id}`),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
};

export const fieldAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/fields`, data),
  getAll: (farmId) => api.get(`/farms/${farmId}/fields`),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/fields/${id}`, data),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/fields/${id}`),
};

export const livestockAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/livestock`, data),
  getAll: (farmId) => api.get(`/farms/${farmId}/livestock`),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/livestock/${id}`, data),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/livestock/${id}`),
};

export const inventoryAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/inventory`, data),
  getAll: (farmId) => api.get(`/farms/${farmId}/inventory`),
  getLowStock: (farmId) => api.get(`/farms/${farmId}/inventory/low-stock`),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/inventory/${id}`, data),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/inventory/${id}`),
};

export const workerAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/workers`, data),
  getAll: (farmId) => api.get(`/farms/${farmId}/workers`),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/workers/${id}`, data),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/workers/${id}`),
};

export const financeAPI = {
  createExpense: (farmId, data) => api.post(`/farms/${farmId}/finance/expense`, data),
  createIncome: (farmId, data) => api.post(`/farms/${farmId}/finance/income`, data),
  getExpenses: (farmId, params) => api.get(`/farms/${farmId}/finance/expenses`, { params }),
  getIncome: (farmId, params) => api.get(`/farms/${farmId}/finance/income`, { params }),
  getSummary: (farmId, params) => api.get(`/farms/${farmId}/finance/summary`, { params }),
};

export const taskAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/tasks`, data),
  getAll: (farmId, params) => api.get(`/farms/${farmId}/tasks`, { params }),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/tasks/${id}`, data),
  complete: (farmId, id) => api.post(`/farms/${farmId}/tasks/${id}/complete`),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/tasks/${id}`),
};

export const diaryAPI = {
  create: (farmId, data) => api.post(`/farms/${farmId}/diary`, data),
  getAll: (farmId, params) => api.get(`/farms/${farmId}/diary`, { params }),
  update: (farmId, id, data) => api.put(`/farms/${farmId}/diary/${id}`, data),
  delete: (farmId, id) => api.delete(`/farms/${farmId}/diary/${id}`),
};

export const activityLogAPI = {
  getAll: (farmId, params) => api.get(`/farms/${farmId}/activity-logs`, { params }),
  getModules: (farmId) => api.get(`/farms/${farmId}/activity-logs/modules`),
  getActions: (farmId, module) => api.get(`/farms/${farmId}/activity-logs/actions`, { params: { module } }),
};

export const aiChatAPI = {
  createSession: (farmId, data) => api.post(`/farms/${farmId}/ai-chat/sessions`, data),
  getSessions: (farmId) => api.get(`/farms/${farmId}/ai-chat/sessions`),
  addMessage: (farmId, data) => api.post(`/farms/${farmId}/ai-chat/messages`, data),
  getMessages: (farmId, sessionId) => api.get(`/farms/${farmId}/ai-chat/messages/${sessionId}`),
  deleteSession: (farmId, sessionId) => api.delete(`/farms/${farmId}/ai-chat/sessions/${sessionId}`),
};

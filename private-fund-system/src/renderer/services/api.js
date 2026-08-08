import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '#/login';
          ElMessage.error('登录已过期，请重新登录');
          break;
        case 403:
          ElMessage.error('权限不足');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error(data.error || '服务器错误');
          break;
        default:
          ElMessage.error(data.error || '请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时');
    } else {
      ElMessage.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh-token')
};

export const projectApi = {
  getList: (params) => api.get('/projects', { params }),
  getDetail: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addDueDiligence: (id, data) => api.post(`/projects/${id}/due-diligence`, data),
  addValuation: (id, data) => api.post(`/projects/${id}/valuation`, data),
  addDecision: (id, data) => api.post(`/projects/${id}/decision`, data),
  addPostInvestment: (id, data) => api.post(`/projects/${id}/post-investment`, data),
  getStatistics: () => api.get('/projects/statistics/overview')
};

export const marketApi = {
  getStocks: (params) => api.get('/market/stocks', { params }),
  getBonds: (params) => api.get('/market/bonds', { params }),
  getFunds: (params) => api.get('/market/funds', { params }),
  getIndices: (params) => api.get('/market/indices', { params }),
  search: (params) => api.get('/market/search', { params }),
  getHistory: (symbol, params) => api.get(`/market/history/${symbol}`, { params }),
  getRealtime: (symbol) => api.get(`/market/realtime/${symbol}`),
  getOverview: () => api.get('/market/overview')
};

export const windApi = {
  getStock: (code, params) => api.get(`/wind/stock/${code}`, { params }),
  getBond: (code, params) => api.get(`/wind/bond/${code}`, { params }),
  getFund: (code, params) => api.get(`/wind/fund/${code}`, { params }),
  getIndex: (code, params) => api.get(`/wind/index/${code}`, { params }),
  getMarketOverview: () => api.get('/wind/market/overview'),
  getIndustry: (code, params) => api.get(`/wind/industry/${code}`, { params }),
  search: (params) => api.get('/wind/search', { params }),
  batch: (data) => api.post('/wind/batch', data)
};

export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  analyzeProject: (data) => api.post('/ai/analyze/project', data),
  analyzeFinancial: (data) => api.post('/ai/analyze/financial', data),
  generateReport: (data) => api.post('/ai/report/generate', data),
  summarizeMarket: (data) => api.post('/ai/market/summarize', data),
  getHistory: (params) => api.get('/ai/history', { params }),
  getSessions: () => api.get('/ai/sessions'),
  deleteSession: (sessionId) => api.delete(`/ai/sessions/${sessionId}`),
  getModelInfo: () => api.get('/ai/model/info')
};

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getProjectDistribution: () => api.get('/dashboard/project-distribution'),
  getInvestmentTrend: (params) => api.get('/dashboard/investment-trend', { params }),
  getRiskAssessment: () => api.get('/dashboard/risk-assessment'),
  getPerformanceMetrics: () => api.get('/dashboard/performance-metrics'),
  getMarketIndices: () => api.get('/dashboard/market-indices'),
  getTopInvestments: () => api.get('/dashboard/top-investments'),
  getRecentActivities: (params) => api.get('/dashboard/recent-activities', { params })
};

export const userApi = {
  getList: (params) => api.get('/users', { params }),
  getDetail: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, newPassword) => api.post(`/users/${id}/reset-password`, { newPassword }),
  toggleStatus: (id) => api.post(`/users/${id}/toggle-status`),
  getLogs: (params) => api.get('/users/logs/list', { params })
};

export default api;

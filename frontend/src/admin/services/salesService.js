// frontend/src/admin/services/salesService.js
import api from './api';

export const fetchActiveSeason    = () => api.get('/sales/goals/active');
export const fetchSalesDashboard  = () => api.get('/sales/dashboard');
export const fetchEmployeeSales   = (employee_id, month) => 
  api.get(`/sales/daily/${employee_id}`, { params: { month } });

export const createSeason         = (payload) => api.post('/sales/goals', payload);
export const postDailySale        = (payload) => api.post('/sales/daily', payload);
export const patchDailySale       = (sale_id, payload) => api.patch(`/sales/daily/${sale_id}`, payload);
// frontend/src/admin/services/salesService.js
import api from './api';

export const fetchActiveSeason     = () => api.get('/sales/goals/active');
export const fetchSalesDashboard   = (month) => api.get('/sales/dashboard', { params: { month } });
export const fetchEmployeeSales    = (employee_id, month) => api.get(`/sales/daily/${employee_id}`, { params: { month } });
export const fetchMonthlyGoals     = (month) => api.get(`/sales/monthly-goals/${month}`);

export const createSeason          = (payload) => api.post('/sales/goals', payload);
export const saveMonthlyGoals      = (payload) => api.post('/sales/monthly-goals', payload);
export const postDailySale         = (payload) => api.post('/sales/daily', payload);
export const patchDailySale        = (sale_id, payload) => api.patch(`/sales/daily/${sale_id}`, payload);
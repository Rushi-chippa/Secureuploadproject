import api from './api';

export const dataService = {
    // Products
    getProducts: async () => api.get('/api/products/'),
    addProduct: async (data) => api.post('/api/products/', data),
    updateProduct: async (id, data) => api.put(`/api/products/${id}`, data),
    deleteProduct: async (id) => api.delete(`/api/products/${id}`),

    // Salesmen
    getSalesmen: async () => api.get('/api/salesmen/'),
    addSalesman: async (data) => api.post('/api/salesmen/', data),
    updateSalesman: async (id, data) => api.put(`/api/salesmen/${id}`, data),
    deleteSalesman: async (id) => api.delete(`/api/salesmen/${id}`),
    getSalesmanDetails: async (id) => api.get(`/api/salesmen/${id}`),
    setSalesmanTarget: async (id, month, target) => api.post(`/api/salesmen/${id}/target`, { month, target }),

    // Sales
    getSales: async (params) => api.get('/api/sales/', { params }),
    addSale: async (data) => api.post('/api/sales/', data),
    updateSale: async (id, data) => api.put(`/api/sales/${id}`, data),
    deleteSale: async (id) => api.delete(`/api/sales/${id}`),

    // Analytics & Reports
    getPredictions: async (params) => api.get('/api/predict-sales', { params }),
    getDashboardStats: async (params) => api.get('/api/analytics/dashboard-stats', { params }),
    getReportsData: async (params) => api.get('/api/analytics/reports', { params }),
    getLeaderboard: async (params) => api.get('/api/analytics/leaderboard', { params }),

    // Advanced Analytics
    getExecutiveKPIs: async () => api.get('/api/analytics/kpi/executive'),
    getABCAnalysis: async () => api.get('/api/analytics/products/abc'),
    getRFMAnalysis: async () => api.get('/api/analytics/customers/rfm'),
    getSalesmanConsistency: async () => api.get('/api/analytics/salesmen/consistency'),

    // Customers
    getCustomers: async () => api.get('/api/customers/'),
    addCustomer: async (data) => api.post('/api/customers/', data),
    deleteCustomer: async (id) => api.delete(`/api/customers/${id}`),

    // Categories
    getCategories: async () => api.get('/api/categories/'),
    addCategory: async (data) => api.post('/api/categories/', data),
    deleteCategory: async (id) => api.delete(`/api/categories/${id}`),
};
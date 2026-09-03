const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data.detail === 'string' ? data.detail : Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : JSON.stringify(data.detail);
    throw new Error(msg || 'Request failed');
  }
  return data;
}

// Customers
export const createCustomer = (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) });
export const getCustomers = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
  return request(`/customers?${qs}`);
};
export const lookupCustomer = (phone) => request(`/customers/lookup?phone=${encodeURIComponent(phone)}`);
export const getCustomer = (id) => request(`/customers/${id}`);
export const updateCustomer = (id, body) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const getCustomerOrders = (id) => request(`/customers/${id}/orders`);

// Orders
export const createOrder = (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) });
export const getOrders = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
  return request(`/orders?${qs}`);
};
export const getOrder = (id) => request(`/orders/${id}`);
export const updateOrder = (id, body) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const updateOrderStatus = (id, body) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
export const addOrderItems = (id, items) => request(`/orders/${id}/items`, { method: 'POST', body: JSON.stringify(items) });
export const removeOrderItem = (orderId, itemId) => request(`/orders/${orderId}/items/${itemId}`, { method: 'DELETE' });
export const getRoundedWeight = (kg) => request(`/orders/round-weight?kg=${kg}`);

// Payments
export const recordPayment = (orderId, body) => request(`/payments/${orderId}`, { method: 'POST', body: JSON.stringify(body) });
export const getPayments = (orderId) => request(`/payments/${orderId}`);

// Prices
export const getPriceList = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
  return request(`/price-list?${qs}`);
};
export const createPrice = (body) => request('/price-list', { method: 'POST', body: JSON.stringify(body) });
export const updatePrice = (id, body) => request(`/price-list/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deletePrice = (id) => request(`/price-list/${id}`, { method: 'DELETE' });

// Expenses
export const createExpense = (body) => request('/expenses', { method: 'POST', body: JSON.stringify(body) });
export const getExpenses = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
  return request(`/expenses?${qs}`);
};
export const deleteExpense = (id) => request(`/expenses/${id}`, { method: 'DELETE' });

// Dashboard & Reports
export const getDashboard = () => request('/dashboard');
export const getDailyReport = (date) => request(`/reports/daily${date ? `?report_date=${date}` : ''}`);

// Settings
export const getSettings = () => request('/settings');
export const updateSetting = (key, value) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });

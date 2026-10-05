// Central API service for SwasthyaSetu

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('swasthya_auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Hospitals
  getHospitals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hospitals${qs ? '?' + qs : ''}`);
  },
  getHospitalById: (id) => request(`/hospitals/${id}`),

  // Departments
  getDepartments: () => request('/departments'),
  getDepartmentById: (id) => request(`/departments/${id}`),

  // Doctors
  getDoctors: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/doctors${qs ? '?' + qs : ''}`);
  },

  // Tokens
  getTokens: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tokens${qs ? '?' + qs : ''}`);
  },
  getTokenById: (id) => request(`/tokens/${id}`),
  createToken: (tokenData) => request('/tokens', { method: 'POST', body: JSON.stringify(tokenData) }),
  cancelToken: (id) => request(`/tokens/${id}`, { method: 'DELETE' }),

  // Live Queue
  getQueue: (hospitalId, departmentId) => request(`/queue/${hospitalId}/${departmentId}`),
  queueAction: (actionData) => request('/queue/action', { method: 'POST', body: JSON.stringify(actionData) }),

  // AI Endpoints
  aiChat: (chatData) => request('/ai/chat', { method: 'POST', body: JSON.stringify(chatData) }),
  aiDepartmentRecommendation: (data) => request('/ai/department-recommendation', { method: 'POST', body: JSON.stringify(data) }),
  aiSearch: (query) => request('/ai/search', { method: 'POST', body: JSON.stringify({ query }) }),
  aiAgent: (agentData) => request('/ai/agent', { method: 'POST', body: JSON.stringify(agentData) }),
  getRAGDocs: () => request('/ai/rag/documents'),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
};

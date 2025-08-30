const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://skill-assessment-portal.onrender.com/api';
};
const API_BASE_URL = getApiBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Skills
  getSkills: async () => {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Questions
  getQuestions: async (skillId) => {
    const response = await fetch(`${API_BASE_URL}/questions/skill/${skillId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllQuestions: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/questions?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Quiz
  submitQuiz: async (quizData) => {
    const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  // Reports
  getUserReports: async (timeframe = 'all') => {
    const response = await fetch(`${API_BASE_URL}/reports/my-performance?timeframe=${timeframe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllUsers: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Direct backend URL - no environment variables, no proxies
const API_BASE_URL = 'https://skill-assessment-portal.onrender.com/api';

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
    console.log('Making login request to:', `${API_BASE_URL}/auth/login`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    console.log('Making register request to:', `${API_BASE_URL}/auth/register`);
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Skills
  getSkills: async () => {
    console.log('Making getSkills request to:', `${API_BASE_URL}/skills`);
    const response = await fetch(`${API_BASE_URL}/skills`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Questions
  getQuestions: async (skillId) => {
    console.log('Making getQuestions request to:', `${API_BASE_URL}/questions/skill/${skillId}`);
    const response = await fetch(`${API_BASE_URL}/questions/skill/${skillId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllQuestions: async (page = 1, limit = 10) => {
    console.log('Making getAllQuestions request to:', `${API_BASE_URL}/questions?page=${page}&limit=${limit}`);
    const response = await fetch(`${API_BASE_URL}/questions?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Quiz
  submitQuiz: async (quizData) => {
    console.log('Making submitQuiz request to:', `${API_BASE_URL}/quiz/submit`);
    const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  // Reports
  getUserReports: async (timeframe = 'all') => {
    console.log('Making getUserReports request to:', `${API_BASE_URL}/reports/my-performance?timeframe=${timeframe}`);
    const response = await fetch(`${API_BASE_URL}/reports/my-performance?timeframe=${timeframe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllUsers: async (page = 1, limit = 10) => {
    console.log('Making getAllUsers request to:', `${API_BASE_URL}/users?page=${page}&limit=${limit}`);
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStatistics: async () => {
    console.log('Making getStatistics request to:', `${API_BASE_URL}/reports/statistics`);
    const response = await fetch(`${API_BASE_URL}/reports/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
// With Vite proxy, you can use relative paths
const API_BASE_URL = 'https://skill-assessment-portal.onrender.com/api';  // This will proxy to http://localhost:5000/api

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
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Skills endpoints
  getSkills: async () => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/skills`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Questions endpoints
  getQuestions: async (skillId) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/questions/skill/${skillId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllQuestions: async (page = 1, limit = 10) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/questions?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Quiz endpoints
  submitQuiz: async (quizData) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  // Reports endpoints
  getUserReports: async (timeframe = 'all') => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/reports/my-performance?timeframe=${timeframe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllUsers: async (page = 1, limit = 10) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/users?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStatistics: async () => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/reports/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createQuestion: async (questionData) => {
    const response = await fetch(`https://skill-assessment-portal.onrender.com/api/questions`, {
      method: 'POST',
      headers:getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
  
    return handleResponse(response);
  },
};
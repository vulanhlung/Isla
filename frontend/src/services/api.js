import axios from 'axios'

// Production: cùng domain với Express nên dùng path tương đối
// Development: VITE_API_URL từ .env hoặc fallback localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
}

// Mood APIs
export const moodAPI = {
  createMood: (data) => api.post('/moods', data),
  getMoodHistory: (params) => api.get('/moods/history', { params }),
}

// Task APIs
export const taskAPI = {
  generateDailyTasks: () => api.post('/tasks/generate-daily', {}),
  getTodayTasks: () => api.get('/tasks/today'),
  updateTaskStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  completeTask: (userTaskId) => api.post('/tasks/complete', { userTaskId }),
}

// Assessment APIs
export const assessmentAPI = {
  createAssessment: (data) => api.post('/assessments', data),
  getAssessmentHistory: (params) => api.get('/assessments', { params }),
  getLatestAssessment: () => api.get('/assessments/latest'),
}

// Journey APIs
export const journeyAPI = {
  generateJourney: () => api.post('/journeys/generate', {}),
}

// Insight APIs
export const insightAPI = {
  generateInsight: (params) => api.post('/insights/generate', {}, { params }),
}

// Recommendation APIs
export const recommendationAPI = {
  generateRecommendation: (params) => api.post('/recommendations/generate', {}, { params }),
}

// Pattern APIs
export const patternAPI = {
  detectPatterns: (params) => api.get('/patterns/detect', { params }),
}

// Chat APIs
export const chatAPI = {
  getChatHistory: (params) => api.get('/chat/history', { params }),
  sendMessage: (data) => api.post('/chat/message', data),
}

// CBT APIs
export const cbtAPI = {
  startSession: () => api.post('/cbt/start', {}),
  continueSession: (data) => api.post('/cbt/continue', data),
  getCBTHistory: () => api.get('/cbt/history'),
}

// Journal APIs
export const journalAPI = {
  createJournal: (data) => api.post('/journals', data),
  getJournals: (params) => api.get('/journals', { params }),
}

// Reflection APIs
export const reflectionAPI = {
  createReflection: (data) => api.post('/reflections', data),
  getReflections: (params) => api.get('/reflections', { params }),
}

// Progress APIs
export const progressAPI = {
  getProgress: () => api.get('/progress/dashboard'),
}

// Dashboard APIs
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
}

export default api

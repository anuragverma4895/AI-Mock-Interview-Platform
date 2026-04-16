import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string, role?: string) =>
    api.post('/auth/register', { email, password, name, role }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updateSettings: (data: any) => api.put('/auth/settings', data),
};

export const resumeAPI = {
  upload: (formData: FormData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getResume: (id: string) => api.get(`/resume/${id}`),
  getUserResumes: (userId: string) => api.get(`/resume/user/${userId}`),
  deleteResume: (id: string) => api.delete(`/resume/${id}`),
};

export const interviewAPI = {
  start: (resumeId?: string, duration?: number, options?: { role?: string; difficulty?: string }) =>
    api.post('/interview/start', { resumeId, duration, ...options }),
  getNextQuestion: (interviewId: string) =>
    api.get(`/interview/next-question/${interviewId}`),
  submitAnswer: (interviewId: string, answer: string) =>
    api.post(`/interview/submit-answer/${interviewId}`, { answer }),
  askFollowUp: (interviewId: string, answer: string) =>
    api.post(`/interview/follow-up/${interviewId}`, { answer }),
  endInterview: (interviewId: string, videoPath?: string, bodyLanguageData?: any) =>
    api.post(`/interview/end/${interviewId}`, { videoPath, bodyLanguageData }),
  getInterview: (id: string) => api.get(`/interview/${id}`),
  getUserInterviews: (userId: string) => api.get(`/interview/user/${userId}`),
  getTranscript: (id: string) => api.get(`/interview/transcript/${id}`),
};

export const videoAPI = {
  uploadChunk: (formData: FormData) =>
    api.post('/video/upload-chunk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  finalize: (interviewId: string, totalChunks: number) =>
    api.post('/video/finalize', { interviewId, totalChunks }),
  getVideoInfo: (id: string) => api.get(`/video/${id}`),
  downloadVideo: (id: string) => api.get(`/video/${id}/download`, { responseType: 'blob' }),
  analyzeBodyLanguage: (frameData: string) =>
    api.post('/video/analyze-body-language', { frameData }),
};

export const analyticsAPI = {
  getUserAnalytics: (userId: string) => api.get(`/analytics/${userId}`),
  getInterviewAnalytics: (id: string) => api.get(`/analytics/interview/${id}`),
};

export default api;
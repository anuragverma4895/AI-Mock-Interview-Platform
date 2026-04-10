import { create } from 'zustand';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  checkToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Decode token to check expiry (simple check, not secure)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();

      if (now > expiry) {
        // Token expired, logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null });
        return false;
      }

      // If token expires in less than 1 hour, try to refresh user data
      if (expiry - now < 3600000) {
        const response = await authAPI.getMe();
        set({ user: response });
        localStorage.setItem('user', JSON.stringify(response));
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
}));
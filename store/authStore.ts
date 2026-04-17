import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Profile {
  id: number;
  role: string;
  bio: string;
  college: string;
  department: string;
  year: string;
  points: number;
  streak_days: number;
  level: number;
  level_title: string;
  interests: string[];
  skills: string[];
  skills_wanted: string[];
  github_url: string;
  linkedin_url: string;
  cgpa: number | null;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const userStr = await SecureStore.getItemAsync('user_data');
      const profileStr = await SecureStore.getItemAsync('profile_data');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        const profile = profileStr ? JSON.parse(profileStr) : null;
        set({ user, profile, isAuthenticated: true, isLoading: false });
        // Refresh profile from server
        try {
          const { data } = await api.get('/profile/');
          await SecureStore.setItemAsync('profile_data', JSON.stringify(data.profile));
          set({ profile: data.profile });
        } catch {}
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));
    await SecureStore.setItemAsync('profile_data', JSON.stringify(data.profile));
    set({ user: data.user, profile: data.profile, isAuthenticated: true });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register/', registerData);
    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));
    set({ user: data.user, profile: null, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refresh = await SecureStore.getItemAsync('refresh_token');
      await api.post('/auth/logout/', { refresh });
    } catch {}
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('profile_data');
    set({ user: null, profile: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...data } : null,
    }));
  },
}));

// ── Role selector hooks ──
export const useIsStudent = () => useAuthStore((s) => s.profile?.role === 'student' || !s.profile?.role);
export const useIsTeacher = () => useAuthStore((s) => s.profile?.role === 'teacher');
export const useIsAdmin   = () => useAuthStore((s) => s.profile?.role === 'admin');
export const useUserRole  = () => useAuthStore((s) => s.profile?.role ?? 'student');

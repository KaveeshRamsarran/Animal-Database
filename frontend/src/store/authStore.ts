import { create } from 'zustand';
import type { UserOut } from '../types';
import { getMe } from '../api/auth';

interface AuthState {
  user: UserOut | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('wildatlas_token'),
  loading: false,
  setToken: (token: string) => {
    localStorage.setItem('wildatlas_token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('wildatlas_token');
    set({ user: null, token: null });
  },
  loadUser: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const user = await getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, token: null, loading: false });
      localStorage.removeItem('wildatlas_token');
    }
  },
}));

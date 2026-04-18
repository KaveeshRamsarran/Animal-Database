import api from './client';
import type { TokenResponse, UserOut } from '../types';

export const register = (email: string, username: string, password: string) =>
  api.post<UserOut>('/auth/register', { email, username, password }).then(r => r.data);

export const login = (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  return api.post<TokenResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).then(r => r.data);
};

export const getMe = () =>
  api.get<UserOut>('/auth/me').then(r => r.data);

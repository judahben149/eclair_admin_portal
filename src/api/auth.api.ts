import api from './axios-config';
import type { LoginRequest, AuthResponse } from '@/types';

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getStoredUsername = (): string | null => {
  return localStorage.getItem('username');
};

export const storeAuthData = (token: string, username: string): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('username', username);
};

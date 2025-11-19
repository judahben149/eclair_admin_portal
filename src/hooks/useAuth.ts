import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authApi from '@/api/auth.api';
import type { LoginRequest } from '@/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = authApi.getStoredToken();
    const storedUsername = authApi.getStoredUsername();

    if (token) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      authApi.storeAuthData(data.token, data.username);
      setIsAuthenticated(true);
      setUsername(data.username);
      toast.success(`Welcome back, ${data.username}!`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setUsername(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return {
    isAuthenticated,
    username,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}

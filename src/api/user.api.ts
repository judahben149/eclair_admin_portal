import api from './axios-config';
import type { ChangePasswordRequest, ChangePasswordResponse } from '@/types';

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await api.patch<ChangePasswordResponse>('/admin/users/me/password', data);
  return response.data;
};

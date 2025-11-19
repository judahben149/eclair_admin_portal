import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as userApi from '@/api/user.api';
import type { ChangePasswordRequest } from '@/types';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });
}

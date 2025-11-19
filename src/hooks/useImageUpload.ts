import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as conceptsApi from '@/api/concepts.api';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => conceptsApi.uploadImage(file, (progress) => {
      setUploadProgress(progress);
    }),
    onSuccess: () => {
      setUploadProgress(null);
      toast.success('Image uploaded successfully');
    },
    onError: (error: any) => {
      setUploadProgress(null);
      const message = error.response?.data?.message || 'Failed to upload image';
      toast.error(message);
    },
  });

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.',
      };
    }

    // Check file size (10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10 MB. Please choose a smaller image.',
      };
    }

    return { valid: true };
  };

  const uploadImage = async (file: File): Promise<string> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return uploadMutation.mutateAsync(file);
  };

  return {
    uploadImage,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    validateFile,
  };
}

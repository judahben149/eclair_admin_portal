import api from './axios-config';
import type { Concept, ConceptListItem, ConceptRequest } from '@/types';

// Admin endpoints (require authentication)
export const getAllConcepts = async (): Promise<ConceptListItem[]> => {
  const response = await api.get<ConceptListItem[]>('/admin/concepts');
  return response.data;
};

export const getConceptById = async (id: number): Promise<Concept> => {
  const response = await api.get<Concept>(`/admin/concepts/${id}`);
  return response.data;
};

export const createConcept = async (data: ConceptRequest): Promise<Concept> => {
  const response = await api.post<Concept>('/admin/concepts', data);
  return response.data;
};

export const updateConcept = async (
  id: number,
  data: ConceptRequest
): Promise<Concept> => {
  const response = await api.patch<Concept>(`/admin/concepts/${id}`, data);
  return response.data;
};

export const deleteConcept = async (id: number): Promise<void> => {
  await api.delete(`/admin/concepts/${id}`);
};

// Public endpoints (for preview/testing)
export const getPublishedConcepts = async (): Promise<ConceptListItem[]> => {
  const response = await api.get<ConceptListItem[]>('/concepts');
  return response.data;
};

export const getPublishedConceptById = async (id: number): Promise<Concept> => {
  const response = await api.get<Concept>(`/concepts/${id}`);
  return response.data;
};

// Image upload endpoint
interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadImage = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ imageUrl: string }>('/admin/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  });

  return response.data.imageUrl;
};

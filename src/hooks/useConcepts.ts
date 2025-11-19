import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as conceptsApi from '@/api/concepts.api';
import type { ConceptRequest } from '@/types';

// Query keys
export const conceptKeys = {
  all: ['concepts'] as const,
  lists: () => [...conceptKeys.all, 'list'] as const,
  list: (filters?: string) => [...conceptKeys.lists(), { filters }] as const,
  details: () => [...conceptKeys.all, 'detail'] as const,
  detail: (id: number) => [...conceptKeys.details(), id] as const,
};

// Get all concepts (admin)
export function useConcepts() {
  return useQuery({
    queryKey: conceptKeys.lists(),
    queryFn: conceptsApi.getAllConcepts,
  });
}

// Get concept by ID (admin)
export function useConcept(id: number) {
  return useQuery({
    queryKey: conceptKeys.detail(id),
    queryFn: () => conceptsApi.getConceptById(id),
    enabled: !!id,
  });
}

// Create concept
export function useCreateConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConceptRequest) => conceptsApi.createConcept(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
      toast.success('Concept created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create concept';
      toast.error(message);
    },
  });
}

// Update concept
export function useUpdateConcept(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConceptRequest) => conceptsApi.updateConcept(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conceptKeys.detail(id) });
      toast.success('Concept updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update concept';
      toast.error(message);
    },
  });
}

// Delete concept
export function useDeleteConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => conceptsApi.deleteConcept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
      toast.success('Concept deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete concept';
      toast.error(message);
    },
  });
}

// Get published concepts (public)
export function usePublishedConcepts() {
  return useQuery({
    queryKey: ['published-concepts'],
    queryFn: conceptsApi.getPublishedConcepts,
  });
}

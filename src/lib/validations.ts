import { z } from 'zod';

// Content item validation
export const contentItemSchema = z.object({
  type: z.enum(['text', 'image'], {
    required_error: 'Content type is required',
  }),
  value: z.string().min(1, 'Content cannot be empty'),
  displayOrder: z.number().int().positive().optional(),
  tempId: z.string().optional(),
});

// Section validation
export const sectionSchema = z.object({
  heading: z
    .string()
    .min(1, 'Section heading is required')
    .max(200, 'Section heading must be 200 characters or less'),
  displayOrder: z.number().int().positive().optional(),
  content: z
    .array(contentItemSchema)
    .min(1, 'Section must have at least one content item'),
  tempId: z.string().optional(),
  id: z.number().optional(),
});

// Concept validation
export const conceptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
  displayOrder: z.number().int().positive().optional(),
  published: z.boolean().optional(),
  sections: z.array(sectionSchema).optional(),
});

// Login validation
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Type exports
export type ContentItemFormData = z.infer<typeof contentItemSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type ConceptFormData = z.infer<typeof conceptSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

import { z } from 'zod';

export const rateCardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'expert']),
  yearsOfExperience: z.number().min(0).max(50),
  location: z.string().min(1, 'Location is required'),
  industry: z.string().optional(),
  projectComplexity: z.enum(['low', 'medium', 'high']).optional(),
  currency: z.string().default('USD'),
  hourlyRate: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    recommended: z.number().min(0),
  }).optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type RateCardInput = z.infer<typeof rateCardSchema>;

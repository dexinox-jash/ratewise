import { z } from 'zod';

export const rateCalculationSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'expert']),
  yearsOfExperience: z.number().min(0).max(50),
  location: z.string().min(1, 'Location is required'),
  industry: z.string().optional(),
  projectComplexity: z.enum(['low', 'medium', 'high']).optional(),
  currency: z.string().default('USD'),
  additionalContext: z.string().optional(),
});

export type RateCalculationInput = z.infer<typeof rateCalculationSchema>;

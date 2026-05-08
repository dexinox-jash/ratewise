import { createChatCompletion } from './client';
import { RateCalculationInput, RateCalculationResult } from '@/types/calculator';

interface CalculationOptions {
  userId?: string;
  tier?: string;
  isAnonymous?: boolean;
}

export async function calculateRate(
  input: RateCalculationInput,
  options: CalculationOptions = {}
): Promise<RateCalculationResult> {
  const { tier = 'free', isAnonymous = false } = options;

  const systemPrompt = `You are an expert freelance rate consultant with deep knowledge of global market rates across all industries.
Your task is to provide accurate, data-driven rate recommendations based on the user's inputs.

Consider the following factors:
- Skill category and specific technologies/skills
- Years of experience
- Geographic location (cost of living adjustments)
- Project complexity
- Current market demand
- Employment type (full-time equivalent vs project-based)

Provide rates in the user's preferred currency. Include both hourly and project-based recommendations.

Respond in JSON format with the following structure:
{
  "hourlyRate": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "projectRate": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "monthlyRate": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "annualRate": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "marketAnalysis": {
    "demandLevel": "low" | "medium" | "high",
    "competitionLevel": "low" | "medium" | "high",
    "marketTrend": "declining" | "stable" | "growing"
  },
  "factors": [
    {
      "name": string,
      "impact": "negative" | "neutral" | "positive",
      "description": string
    }
  ],
  "recommendations": string[],
  "confidenceScore": number
}`;

  const userPrompt = `Calculate optimal freelance rates for the following profile:

Skills: ${input.skills.join(', ')}
Experience Level: ${input.experienceLevel} (${input.yearsOfExperience} years)
Location: ${input.location}
Industry: ${input.industry || 'Not specified'}
Project Complexity: ${input.projectComplexity || 'medium'}
Currency: ${input.currency || 'USD'}

Additional context: ${input.additionalContext || 'None provided'}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  try {
    const response = await createChatCompletion(messages, {
      responseFormat: { type: 'json_object' },
    });

    const result = JSON.parse(response) as RateCalculationResult;

    // Add metadata
    return {
      ...result,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      input,
      tier,
      isAnonymous,
    };
  } catch (error) {
    console.error('Rate calculation error:', error);
    throw new Error('Failed to calculate rate');
  }
}

export async function getRateAdvice(
  question: string,
  context: RateCalculationInput
): Promise<string> {
  const systemPrompt = `You are a helpful freelance rate consultant. Provide concise, actionable advice based on the user's question and their profile context.
Keep responses under 200 words and focus on practical recommendations.`;

  const userPrompt = `Question: ${question}

My profile:
- Skills: ${context.skills.join(', ')}
- Experience: ${context.yearsOfExperience} years
- Location: ${context.location}
- Industry: ${context.industry || 'Not specified'}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  return createChatCompletion(messages, {
    maxTokens: 300,
    temperature: 0.5,
  });
}

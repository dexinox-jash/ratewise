export interface RateCalculationInput {
  skills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'expert';
  yearsOfExperience: number;
  location: string;
  industry?: string;
  projectComplexity?: 'low' | 'medium' | 'high';
  currency?: string;
  additionalContext?: string;
}

export interface RateRange {
  min: number;
  max: number;
  recommended: number;
}

export interface MarketAnalysis {
  demandLevel: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  marketTrend: 'declining' | 'stable' | 'growing';
}

export interface RateFactor {
  name: string;
  impact: 'negative' | 'neutral' | 'positive';
  description: string;
}

export interface RateCalculationResult {
  id: string;
  createdAt: string;
  input: RateCalculationInput;
  hourlyRate: RateRange;
  projectRate: RateRange;
  monthlyRate: RateRange;
  annualRate: RateRange;
  marketAnalysis: MarketAnalysis;
  factors: RateFactor[];
  recommendations: string[];
  confidenceScore: number;
  tier?: string;
  isAnonymous?: boolean;
}

export interface SavedCalculation {
  id: string;
  userId: string;
  inputData: RateCalculationInput;
  resultData: RateCalculationResult;
  createdAt: string;
  updatedAt: string;
}

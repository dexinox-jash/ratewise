'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { rateCalculationSchema, type RateCalculationInput } from '@/lib/validations/calculator';
import { RateCalculationResult } from '@/types/calculator';

export function RateCalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RateCalculationResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RateCalculationInput>({
    resolver: zodResolver(rateCalculationSchema),
    defaultValues: {
      skills: [],
      experienceLevel: 'mid',
      yearsOfExperience: 3,
      location: '',
      currency: 'USD',
    },
  });

  async function onSubmit(data: RateCalculationInput) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate rate');
      }

      const result = await response.json();
      setResult(result);
      toast.success('Rate calculated successfully!');
    } catch (error) {
      toast.error('Failed to calculate rate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            placeholder="React, TypeScript, Node.js"
            {...register('skills', {
              setValueAs: (v) => v.split(',').map((s: string) => s.trim()).filter(Boolean),
            })}
          />
          {errors.skills && (
            <p className="text-sm text-red-500">{errors.skills.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select
            onValueChange={(value) => setValue('experienceLevel', value as any)}
            defaultValue="mid"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
              <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
              <SelectItem value="expert">Expert Level (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min={0}
            max={50}
            {...register('yearsOfExperience', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            {...register('location')}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            onValueChange={(value) => setValue('currency', value)}
            defaultValue="USD"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Calculating...' : 'Calculate Rate'}
        </Button>
      </form>

      {result && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Your Rate Recommendation</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="text-2xl font-bold">
                ${result.hourlyRate.recommended}/hr
              </p>
              <p className="text-sm text-muted-foreground">
                Range: ${result.hourlyRate.min} - ${result.hourlyRate.max}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Annual Rate</p>
              <p className="text-2xl font-bold">
                ${result.annualRate.recommended.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

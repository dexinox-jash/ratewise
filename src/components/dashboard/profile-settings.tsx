'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        reset({
          fullName: profile.full_name || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
          timezone: profile.timezone || '',
        });
      }
    }

    loadProfile();
  }, [supabase, reset]);

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Not authenticated');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        bio: data.bio,
        website: data.website,
        location: data.location,
        timezone: data.timezone,
      })
      .eq('id', session.user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your public profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} placeholder="City, Country" />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

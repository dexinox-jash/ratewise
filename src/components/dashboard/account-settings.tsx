'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export function AccountSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handlePasswordReset() {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user.email) {
      toast.error('Not authenticated');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      session.user.email,
      {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      }
    );

    if (error) {
      toast.error('Failed to send password reset email');
    } else {
      toast.success('Password reset email sent');
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Password</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Change your password to keep your account secure.
          </p>
          <Button onClick={handlePasswordReset} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Reset Password'}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </CardContent>
    </Card>
  );
}

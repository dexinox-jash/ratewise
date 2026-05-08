'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email_notifications, marketing_emails')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setEmailNotifications(profile.email_notifications);
        setMarketingEmails(profile.marketing_emails);
      }
    }

    loadSettings();
  }, [supabase]);

  async function updateSetting(key: string, value: boolean) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [key]: value })
      .eq('id', session.user.id);

    if (error) {
      toast.error('Failed to update setting');
    } else {
      toast.success('Setting updated');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account activity.
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => {
              setEmailNotifications(checked);
              updateSetting('email_notifications', checked);
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-emails">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new features and promotions.
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={marketingEmails}
            onCheckedChange={(checked) => {
              setMarketingEmails(checked);
              updateSetting('marketing_emails', checked);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

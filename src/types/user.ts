export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  primarySkills?: string[];
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  updatedAt: string;
}

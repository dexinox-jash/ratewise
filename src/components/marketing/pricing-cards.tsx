'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getStripe } from '@/lib/stripe/client';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '5 calculations per day',
      '3 saved rate cards',
      'Basic market data',
      'Email support',
    ],
    cta: 'Get Started',
    priceId: null,
  },
  {
    name: 'Pro',
    description: 'For serious freelancers',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Unlimited calculations',
      'Unlimited rate cards',
      'AI rate assistant',
      'Advanced analytics',
      'API access',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
    },
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For teams and agencies',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'White-label options',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
    },
  },
];

export function PricingCards() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleSubscribe(planName: string, priceId: string | null) {
    if (!priceId) {
      // Free plan - just redirect to signup
      window.location.href = '/signup';
      return;
    }

    setIsLoading(planName);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      if (url) {
        window.location.href = url;
      } else {
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2">
        <Label htmlFor="billing-toggle" className={!isYearly ? 'text-primary' : 'text-muted-foreground'}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? 'text-primary' : 'text-muted-foreground'}>
          Yearly
          <span className="ml-1 text-xs text-green-500">(Save 20%)</span>
        </Label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? 'border-primary shadow-lg' : ''}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() =>
                  handleSubscribe(
                    plan.name,
                    plan.priceId
                      ? isYearly
                        ? plan.priceId.yearly
                        : plan.priceId.monthly
                      : null
                  )
                }
                disabled={isLoading === plan.name}
              >
                {isLoading === plan.name ? 'Loading...' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

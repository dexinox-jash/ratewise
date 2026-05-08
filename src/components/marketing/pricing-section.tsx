"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Sparkles, Zap, Crown } from "lucide-react"

interface PricingFeature {
  name: string
  free: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}

const features: PricingFeature[] = [
  {
    name: "Rate Calculations",
    free: "20/month",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "Platform Support",
    free: "3 platforms",
    pro: "All platforms",
    enterprise: "All platforms + API",
  },
  {
    name: "Historical Data",
    free: false,
    pro: "90 days",
    enterprise: "Unlimited",
  },
  {
    name: "Detailed Breakdown",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    name: "Export Reports",
    free: false,
    pro: "PDF & CSV",
    enterprise: "All formats",
  },
  {
    name: "Analytics Dashboard",
    free: "Basic",
    pro: "Advanced",
    enterprise: "Custom",
  },
  {
    name: "Team Members",
    free: "1",
    pro: "3",
    enterprise: "Unlimited",
  },
  {
    name: "API Access",
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    name: "Priority Support",
    free: false,
    pro: "Email",
    enterprise: "24/7 Dedicated",
  },
  {
    name: "Custom Integrations",
    free: false,
    pro: false,
    enterprise: true,
  },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground mx-auto" />
  }
  return <span className="text-sm font-medium">{value}</span>
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Free</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.free === true ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : feature.free === false ? (
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-sm">
                      {feature.name}
                      {typeof feature.free === "string" && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({feature.free})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Most Popular
            </Badge>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Pro</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                For serious creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.slice(0, 7).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.pro === true ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : feature.pro === false ? (
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-sm">
                      {feature.name}
                      {typeof feature.pro === "string" && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({feature.pro})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/upgrade">
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle>Enterprise</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                For agencies & teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.enterprise === true ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : feature.enterprise === false ? (
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-sm">
                      {feature.name}
                      {typeof feature.enterprise === "string" && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({feature.enterprise})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Feature</th>
                <th className="text-center py-4 px-4 font-semibold">Free</th>
                <th className="text-center py-4 px-4 font-semibold text-primary">
                  Pro
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-4 px-4 text-sm">{feature.name}</td>
                  <td className="py-4 px-4 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <FeatureValue value={feature.pro} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <FeatureValue value={feature.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Have questions?{" "}
            <Link href="/faq" className="text-primary hover:underline">
              Check our FAQ
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Sparkles, Zap, Crown, Building2, ArrowLeft, CreditCard } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    features: [
      "20 calculations per month",
      "3 platform support",
      "Basic rate breakdown",
      "Standard support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious creators",
    price: { monthly: 19, yearly: 190 },
    icon: Sparkles,
    popular: true,
    features: [
      "Unlimited calculations",
      "All platforms supported",
      "Advanced analytics",
      "90-day history",
      "Export PDF & CSV reports",
      "3 team members",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For agencies & teams",
    price: { monthly: 99, yearly: 990 },
    icon: Crown,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "API access",
      "Unlimited history",
      "Custom integrations",
      "White-label options",
      "24/7 dedicated support",
      "Account manager",
    ],
    cta: "Contact Sales",
  },
]

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What happens when I exceed my free calculations?",
    answer:
      "Once you reach your monthly limit, you'll need to wait until the next month or upgrade to Pro for unlimited calculations.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Can I switch between monthly and yearly billing?",
    answer:
      "Yes, you can switch your billing cycle at any time. Changes will take effect at the start of your next billing period.",
  },
]

export default function UpgradePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Upgrade Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade
              anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          <Tabs defaultValue="monthly" className="w-full max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly
                  <Badge variant="secondary" className="ml-2">
                    Save 17%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.popular
                        ? "border-primary shadow-lg scale-105"
                        : ""
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <plan.icon
                          className={`h-5 w-5 ${
                            plan.popular ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <CardTitle>{plan.name}</CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          ${plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3"
                          >
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        disabled={plan.disabled}
                      >
                        {plan.id === "enterprise" ? (
                          <>
                            <Building2 className="mr-2 h-4 w-4" />
                            {plan.cta}
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {plan.cta}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="yearly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.popular
                        ? "border-primary shadow-lg scale-105"
                        : ""
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <plan.icon
                          className={`h-5 w-5 ${
                            plan.popular ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <CardTitle>{plan.name}</CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          ${plan.price.yearly}
                        </span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3"
                          >
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        disabled={plan.disabled}
                      >
                        {plan.id === "enterprise" ? (
                          <>
                            <Building2 className="mr-2 h-4 w-4" />
                            {plan.cta}
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {plan.cta}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Support CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Still have questions?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

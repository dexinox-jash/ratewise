"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Globe,
  Clock,
  Award,
} from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Accurate Rate Calculator",
    description:
      "Get precise rate estimates based on your followers, engagement, content type, and market demand.",
    color: "bg-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Data",
    description:
      "Our algorithms analyze millions of data points to give you the most current market rates.",
    color: "bg-green-500",
  },
  {
    icon: Shield,
    title: "Industry Standard Formulas",
    description:
      "Built on proven methodologies used by top influencer marketing agencies worldwide.",
    color: "bg-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get your rate estimate in seconds. No waiting, no complicated processes.",
    color: "bg-amber-500",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description:
      "Understand how each factor affects your rate with our comprehensive breakdown.",
    color: "bg-pink-500",
  },
  {
    icon: Globe,
    title: "Multi-Platform Support",
    description:
      "Calculate rates for Instagram, TikTok, YouTube, Twitter, LinkedIn, and more.",
    color: "bg-cyan-500",
  },
  {
    icon: Clock,
    title: "Historical Tracking",
    description:
      "Track how your rates change over time and identify growth opportunities.",
    color: "bg-indigo-500",
  },
  {
    icon: Award,
    title: "Pro Insights",
    description:
      "Unlock advanced features and detailed reports with our Pro plan.",
    color: "bg-rose-500",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Price Your Content
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            RateWise provides all the tools you need to understand your value
            and negotiate better deals with brands.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            And much more coming soon...
          </p>
        </div>
      </div>
    </section>
  )
}

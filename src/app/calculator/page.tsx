"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { CalculatorForm, CalculatorData } from "@/components/calculator/calculator-form"
import { ResultsDisplay } from "@/components/calculator/results-display"
import { PriceBreakdown } from "@/components/calculator/price-breakdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Calculator, ArrowRight, RefreshCw, Sparkles } from "lucide-react"

interface CalculationResult {
  estimatedRate: number
  rateRange: { min: number; max: number }
  platform: string
  tier: string
  breakdown: {
    baseRate: number
    platformMultiplier: number
    engagementMultiplier: number
    contentTypeMultiplier: number
    nicheMultiplier: number
    usageRightsMultiplier: number
    exclusivityMultiplier: number
  }
}

function calculateRate(data: CalculatorData): CalculationResult {
  // Base rate calculation (simplified formula)
  const baseRate = Math.sqrt(data.followers) * 10

  // Platform multipliers
  const platformMultipliers: Record<string, number> = {
    instagram: 1.2,
    tiktok: 1.3,
    youtube: 1.4,
    twitter: 0.9,
    linkedin: 1.1,
  }

  // Content type multipliers
  const contentTypeMultipliers: Record<string, number> = {
    post: 1.0,
    carousel: 1.15,
    reel: 1.25,
    story: 0.8,
    "long-video": 1.5,
    live: 1.3,
  }

  // Niche multipliers
  const nicheMultipliers: Record<string, number> = {
    fashion: 1.2,
    tech: 1.3,
    fitness: 1.1,
    food: 1.0,
    travel: 1.15,
    gaming: 1.05,
    finance: 1.4,
    lifestyle: 1.0,
    education: 1.1,
    entertainment: 1.05,
  }

  // Usage rights multipliers
  const usageRightsMultipliers: Record<string, number> = {
    "30-days": 1.0,
    "90-days": 1.15,
    "1-year": 1.3,
    perpetual: 1.5,
  }

  // Exclusivity multipliers
  const exclusivityMultipliers: Record<string, number> = {
    none: 1.0,
    brand: 1.2,
    category: 1.4,
    full: 1.8,
  }

  // Engagement multiplier (higher engagement = higher rate)
  const engagementMultiplier = 1 + (data.engagement / 10)

  // Calculate final rate
  const platformMultiplier = platformMultipliers[data.platform] || 1.0
  const contentMultiplier = contentTypeMultipliers[data.contentType] || 1.0
  const nicheMultiplier = nicheMultipliers[data.niche] || 1.0
  const usageMultiplier = usageRightsMultipliers[data.usageRights] || 1.0
  const exclusivityMultiplier = exclusivityMultipliers[data.exclusivity] || 1.0

  const totalMultiplier =
    platformMultiplier *
    engagementMultiplier *
    contentMultiplier *
    nicheMultiplier *
    usageMultiplier *
    exclusivityMultiplier

  const estimatedRate = Math.round(baseRate * totalMultiplier)

  // Determine tier
  let tier = "nano"
  if (data.followers >= 1000000) tier = "mega"
  else if (data.followers >= 100000) tier = "macro"
  else if (data.followers >= 50000) tier = "mid"
  else if (data.followers >= 10000) tier = "micro"

  // Calculate rate range (±20%)
  const rateRange = {
    min: Math.round(estimatedRate * 0.8),
    max: Math.round(estimatedRate * 1.2),
  }

  return {
    estimatedRate,
    rateRange,
    platform: data.platform,
    tier,
    breakdown: {
      baseRate: Math.round(baseRate),
      platformMultiplier,
      engagementMultiplier,
      contentTypeMultiplier: contentMultiplier,
      nicheMultiplier,
      usageRightsMultiplier: usageMultiplier,
      exclusivityMultiplier,
    },
  }
}

export default function CalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = (data: CalculatorData) => {
    setIsCalculating(true)

    // Simulate calculation delay
    setTimeout(() => {
      const calculationResult = calculateRate(data)
      setResult(calculationResult)
      setIsCalculating(false)
      toast.success("Rate calculated successfully!")
    }, 500)
  }

  const handleSave = () => {
    toast.success("Calculation saved to your history!")
  }

  const handleShare = () => {
    toast.success("Share link copied to clipboard!")
  }

  const handleReset = () => {
    setResult(null)
    toast.info("Form reset. Enter new details to calculate.")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              Rate Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter your details below to get an accurate estimate of what you
              should charge for sponsored content.
            </p>
          </div>

          {/* Calculator Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Form Section */}
            <div>
              <CalculatorForm onCalculate={handleCalculate} />
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result ? (
                <>
                  <Tabs defaultValue="results" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="results">Results</TabsTrigger>
                      <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    </TabsList>
                    <TabsContent value="results" className="mt-4">
                      <ResultsDisplay
                        estimatedRate={result.estimatedRate}
                        rateRange={result.rateRange}
                        platform={result.platform}
                        tier={result.tier}
                        onSave={handleSave}
                        onShare={handleShare}
                      />
                    </TabsContent>
                    <TabsContent value="breakdown" className="mt-4">
                      <PriceBreakdown
                        baseRate={result.breakdown.baseRate}
                        platformMultiplier={result.breakdown.platformMultiplier}
                        engagementMultiplier={result.breakdown.engagementMultiplier}
                        contentTypeMultiplier={result.breakdown.contentTypeMultiplier}
                        nicheMultiplier={result.breakdown.nicheMultiplier}
                        usageRightsMultiplier={result.breakdown.usageRightsMultiplier}
                        exclusivityMultiplier={result.breakdown.exclusivityMultiplier}
                        finalRate={result.estimatedRate}
                      />
                    </TabsContent>
                  </Tabs>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Calculate Another Rate
                  </Button>
                </>
              ) : (
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Ready to Calculate
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      Fill out the form on the left and click "Calculate My
                      Rate" to see your estimated earnings.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Pro CTA */}
          {!result && (
            <div className="mt-16 max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Unlock Advanced Features
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Pro for unlimited calculations, historical data,
                    and detailed analytics.
                  </p>
                  <Button asChild>
                    <a href="/upgrade">
                      Upgrade to Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

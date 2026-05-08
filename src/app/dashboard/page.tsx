"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentCalculations } from "@/components/dashboard/recent-calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Calculator,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Crown,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your rates
          </p>
        </div>
        <Link href="/calculator">
          <Button>
            <Calculator className="mr-2 h-4 w-4" />
            New Calculation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards
        userTier="free"
        calculationsCount={15}
        calculationsLimit={20}
        avgRate={2500}
        totalSavings={15000}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Calculations */}
        <div className="lg:col-span-2">
          <RecentCalculations />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/calculator">
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate New Rate
                </Button>
              </Link>
              <Link href="/dashboard/history">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Usage</CardTitle>
              <CardDescription>
                You're using 15 of 20 free calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                5 calculations remaining this month
              </p>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Get unlimited calculations and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  "Unlimited calculations",
                  "Advanced analytics",
                  "Export reports",
                  "Priority support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/upgrade">
                <Button className="w-full">
                  Upgrade Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Higher engagement rates can increase your pricing by up to 50%.
                Focus on creating engaging content!
              </p>
              <Link href="/blog/engagement-tips">
                <Button variant="link" size="sm" className="p-0">
                  Learn more
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

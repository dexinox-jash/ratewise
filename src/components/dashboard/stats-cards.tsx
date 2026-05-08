"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  TrendingUp,
  Crown,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react"

interface StatsCardsProps {
  userTier?: "free" | "pro" | "enterprise"
  calculationsCount?: number
  calculationsLimit?: number
  avgRate?: number
  totalSavings?: number
}

export function StatsCards({
  userTier = "free",
  calculationsCount = 15,
  calculationsLimit = 20,
  avgRate = 2500,
  totalSavings = 15000,
}: StatsCardsProps) {
  const usagePercentage = (calculationsCount / calculationsLimit) * 100

  const stats = [
    {
      title: "Calculations Used",
      value: `${calculationsCount}/${calculationsLimit}`,
      description: "This month",
      icon: Calculator,
      showProgress: true,
      progress: usagePercentage,
      color: usagePercentage > 80 ? "text-amber-500" : "text-primary",
    },
    {
      title: "Average Rate",
      value: `$${avgRate.toLocaleString()}`,
      description: "Per post",
      icon: TrendingUp,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Value",
      value: `$${totalSavings.toLocaleString()}`,
      description: "Estimated earnings",
      icon: BarChart3,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Plan Status",
      value: userTier === "pro" ? "Pro" : "Free",
      description: userTier === "pro" ? "All features unlocked" : "Upgrade for more",
      icon: userTier === "pro" ? Crown : Zap,
      badge: userTier === "pro" ? "Active" : "Limited",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend && (
                <Badge
                  variant={stat.trendUp ? "default" : "destructive"}
                  className="text-xs"
                >
                  {stat.trend}
                </Badge>
              )}
              {stat.badge && (
                <Badge
                  variant={stat.badge === "Active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stat.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {stat.showProgress && (
              <div className="mt-3">
                <Progress
                  value={stat.progress}
                  className="h-2"
                />
                <p className={`text-xs mt-1 ${stat.color}`}>
                  {stat.progress?.toFixed(0)}% used
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

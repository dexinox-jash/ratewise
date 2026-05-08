"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info, TrendingUp, Users, Film, Target, Lock, Star } from "lucide-react"

interface PriceBreakdownProps {
  baseRate: number
  platformMultiplier: number
  engagementMultiplier: number
  contentTypeMultiplier: number
  nicheMultiplier: number
  usageRightsMultiplier: number
  exclusivityMultiplier: number
  finalRate: number
}

interface MultiplierItem {
  name: string
  icon: React.ReactNode
  multiplier: number
  description: string
  color: string
}

function formatMultiplier(value: number): string {
  if (value >= 1) return `+${((value - 1) * 100).toFixed(0)}%`
  return `${((value - 1) * 100).toFixed(0)}%`
}

function getMultiplierColor(value: number): string {
  if (value >= 1.5) return "text-green-600 bg-green-100"
  if (value >= 1.2) return "text-blue-600 bg-blue-100"
  if (value >= 1) return "text-gray-600 bg-gray-100"
  return "text-red-600 bg-red-100"
}

export function PriceBreakdown({
  baseRate,
  platformMultiplier,
  engagementMultiplier,
  contentTypeMultiplier,
  nicheMultiplier,
  usageRightsMultiplier,
  exclusivityMultiplier,
  finalRate,
}: PriceBreakdownProps) {
  const multipliers: MultiplierItem[] = [
    {
      name: "Platform",
      icon: <Star className="h-4 w-4" />,
      multiplier: platformMultiplier,
      description: "Platform-specific rate adjustment",
      color: "bg-blue-500",
    },
    {
      name: "Engagement",
      icon: <TrendingUp className="h-4 w-4" />,
      multiplier: engagementMultiplier,
      description: "Based on your engagement rate",
      color: "bg-green-500",
    },
    {
      name: "Content Type",
      icon: <Film className="h-4 w-4" />,
      multiplier: contentTypeMultiplier,
      description: "Content format complexity",
      color: "bg-purple-500",
    },
    {
      name: "Niche",
      icon: <Target className="h-4 w-4" />,
      multiplier: nicheMultiplier,
      description: "Industry-specific demand",
      color: "bg-amber-500",
    },
    {
      name: "Usage Rights",
      icon: <Lock className="h-4 w-4" />,
      multiplier: usageRightsMultiplier,
      description: "Content usage duration",
      color: "bg-pink-500",
    },
    {
      name: "Exclusivity",
      icon: <Users className="h-4 w-4" />,
      multiplier: exclusivityMultiplier,
      description: "Competition restrictions",
      color: "bg-red-500",
    },
  ]

  const totalMultiplier =
    platformMultiplier *
    engagementMultiplier *
    contentTypeMultiplier *
    nicheMultiplier *
    usageRightsMultiplier *
    exclusivityMultiplier

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Price Breakdown
        </CardTitle>
        <CardDescription>
          How your rate is calculated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Rate */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Base Rate</p>
            <p className="text-sm text-muted-foreground">
              Starting point based on follower count
            </p>
          </div>
          <p className="text-xl font-semibold">
            ${baseRate.toLocaleString()}
          </p>
        </div>

        {/* Multipliers */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Applied Multipliers
          </p>
          <TooltipProvider>
            {multipliers.map((item) => (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-help">
                    <div
                      className={`p-2 rounded-md ${item.color} text-white`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.name}</span>
                        <Badge
                          variant="secondary"
                          className={getMultiplierColor(item.multiplier)}
                        >
                          {formatMultiplier(item.multiplier)}
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min(item.multiplier * 50, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Multiplier: {item.multiplier.toFixed(2)}x
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Total Multiplier */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div>
            <p className="font-medium text-primary">Total Multiplier</p>
            <p className="text-sm text-muted-foreground">
              Combined effect of all factors
            </p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {totalMultiplier.toFixed(2)}x
          </p>
        </div>

        {/* Final Calculation */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Base Rate × Total Multiplier</span>
            <span>
              ${baseRate.toLocaleString()} × {totalMultiplier.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Final Rate</span>
            <span className="text-2xl font-bold text-primary">
              ${finalRate.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

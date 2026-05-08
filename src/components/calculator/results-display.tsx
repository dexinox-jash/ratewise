"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Download, Share2, Save } from "lucide-react"

interface ResultsDisplayProps {
  estimatedRate: number
  rateRange: { min: number; max: number }
  platform: string
  tier: string
  onSave?: () => void
  onShare?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    nano: "bg-slate-500",
    micro: "bg-blue-500",
    mid: "bg-green-500",
    macro: "bg-purple-500",
    mega: "bg-amber-500",
  }
  return colors[tier.toLowerCase()] || "bg-gray-500"
}

export function ResultsDisplay({
  estimatedRate,
  rateRange,
  platform,
  tier,
  onSave,
  onShare,
}: ResultsDisplayProps) {
  return (
    <Card className="w-full border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Your Estimated Rate
            </CardTitle>
            <CardDescription>
              Based on your profile and market data
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={`${getTierColor(tier)} text-white capitalize`}
          >
            {tier} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Main Rate Display */}
        <div className="text-center py-6 bg-gradient-to-b from-primary/10 to-transparent rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Recommended Rate</p>
          <p className="text-5xl font-bold text-primary">
            {formatCurrency(estimatedRate)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            per {platform} post
          </p>
        </div>

        {/* Rate Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Market Range</span>
            <span className="font-medium">
              {formatCurrency(rateRange.min)} - {formatCurrency(rateRange.max)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${
                  ((estimatedRate - rateRange.min) /
                    (rateRange.max - rateRange.min)) *
                  100
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Your rate is positioned in the optimal range
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">CPM</span>
            </div>
            <p className="text-lg font-semibold">
              ${((estimatedRate / 1000) * 10).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Value Score</span>
            </div>
            <p className="text-lg font-semibold">8.5/10</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" className="flex-1" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

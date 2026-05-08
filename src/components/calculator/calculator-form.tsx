"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator, Users, TrendingUp, Film, Target, Lock, Star } from "lucide-react"

interface CalculatorFormProps {
  onCalculate: (data: CalculatorData) => void
}

export interface CalculatorData {
  platform: string
  followers: number
  engagement: number
  contentType: string
  niche: string
  usageRights: string
  exclusivity: string
}

const platforms = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
]

const contentTypes = [
  { value: "post", label: "Single Post" },
  { value: "carousel", label: "Carousel/Multi-image" },
  { value: "reel", label: "Reel/Short Video" },
  { value: "story", label: "Story" },
  { value: "long-video", label: "Long-form Video" },
  { value: "live", label: "Live Stream" },
]

const niches = [
  { value: "fashion", label: "Fashion & Beauty" },
  { value: "tech", label: "Technology" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "food", label: "Food & Cooking" },
  { value: "travel", label: "Travel" },
  { value: "gaming", label: "Gaming" },
  { value: "finance", label: "Finance" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
]

const usageRights = [
  { value: "30-days", label: "30 Days Usage" },
  { value: "90-days", label: "90 Days Usage" },
  { value: "1-year", label: "1 Year Usage" },
  { value: "perpetual", label: "Perpetual Rights" },
]

const exclusivityOptions = [
  { value: "none", label: "No Exclusivity" },
  { value: "brand", label: "Brand Exclusive" },
  { value: "category", label: "Category Exclusive" },
  { value: "full", label: "Full Exclusivity" },
]

export function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculatorData>({
    platform: "",
    followers: 10000,
    engagement: 3,
    contentType: "",
    niche: "",
    usageRights: "",
    exclusivity: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCalculate(formData)
  }

  const updateField = <K extends keyof CalculatorData>(
    field: K,
    value: CalculatorData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Rate Calculator
        </CardTitle>
        <CardDescription>
          Enter your details to get an accurate rate estimate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Platform
            </Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => updateField("platform", value)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <span className="mr-2">{platform.icon}</span>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Followers */}
          <div className="space-y-2">
            <Label htmlFor="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Follower Count
            </Label>
            <Input
              id="followers"
              type="number"
              min="0"
              value={formData.followers}
              onChange={(e) =>
                updateField("followers", parseInt(e.target.value) || 0)
              }
              placeholder="e.g., 50000"
            />
            <p className="text-xs text-muted-foreground">
              Your total follower count across the selected platform
            </p>
          </div>

          {/* Engagement Rate */}
          <div className="space-y-2">
            <Label htmlFor="engagement" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Engagement Rate (%)
            </Label>
            <Input
              id="engagement"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.engagement}
              onChange={(e) =>
                updateField("engagement", parseFloat(e.target.value) || 0)
              }
              placeholder="e.g., 4.5"
            />
            <p className="text-xs text-muted-foreground">
              Average engagement rate (likes + comments + shares / followers)
            </p>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="contentType" className="flex items-center gap-2">
              <Film className="h-4 w-4 text-muted-foreground" />
              Content Type
            </Label>
            <Select
              value={formData.contentType}
              onValueChange={(value) => updateField("contentType", value)}
            >
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Niche */}
          <div className="space-y-2">
            <Label htmlFor="niche" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Content Niche
            </Label>
            <Select
              value={formData.niche}
              onValueChange={(value) => updateField("niche", value)}
            >
              <SelectTrigger id="niche">
                <SelectValue placeholder="Select your niche" />
              </SelectTrigger>
              <SelectContent>
                {niches.map((niche) => (
                  <SelectItem key={niche.value} value={niche.value}>
                    {niche.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usage Rights */}
          <div className="space-y-2">
            <Label htmlFor="usageRights" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Usage Rights
            </Label>
            <Select
              value={formData.usageRights}
              onValueChange={(value) => updateField("usageRights", value)}
            >
              <SelectTrigger id="usageRights">
                <SelectValue placeholder="Select usage rights" />
              </SelectTrigger>
              <SelectContent>
                {usageRights.map((right) => (
                  <SelectItem key={right.value} value={right.value}>
                    {right.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exclusivity */}
          <div className="space-y-2">
            <Label htmlFor="exclusivity" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Exclusivity
            </Label>
            <Select
              value={formData.exclusivity}
              onValueChange={(value) => updateField("exclusivity", value)}
            >
              <SelectTrigger id="exclusivity">
                <SelectValue placeholder="Select exclusivity level" />
              </SelectTrigger>
              <SelectContent>
                {exclusivityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate My Rate
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

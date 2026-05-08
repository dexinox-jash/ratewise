"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Calculator,
  History,
  BarChart3,
  Settings,
  CreditCard,
  HelpCircle,
  Crown,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  userTier?: "free" | "pro" | "enterprise"
}

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
]

const secondaryNavItems = [
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
]

export function Sidebar({ userTier = "free" }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                R
              </span>
            </div>
            <span className="font-bold text-lg">RateWise</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-lg">
              R
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "hidden")}
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Expand Button (when collapsed) */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">
              MAIN
            </p>
          )}
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">
              SETTINGS
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Upgrade Card */}
      {!collapsed && userTier === "free" && (
        <div className="p-4 m-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get unlimited calculations and advanced analytics
          </p>
          <Link href="/upgrade">
            <Button className="w-full" size="sm">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {/* User Tier Badge */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <Badge
            variant={userTier === "pro" ? "default" : "secondary"}
            className="w-full justify-center"
          >
            {userTier === "pro" && <Crown className="h-3 w-3 mr-1" />}
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
          </Badge>
        </div>
      )}

      {/* Logout */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}

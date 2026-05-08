import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RateWise - Know Your Worth as a Creator",
  description:
    "Get accurate, data-driven rate estimates for your content. Stop guessing what to charge and start earning what you deserve.",
  keywords: [
    "influencer rate calculator",
    "content creator pricing",
    "social media rates",
    "influencer marketing",
    "creator economy",
  ],
  authors: [{ name: "RateWise" }],
  openGraph: {
    title: "RateWise - Know Your Worth as a Creator",
    description:
      "Get accurate, data-driven rate estimates for your content.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

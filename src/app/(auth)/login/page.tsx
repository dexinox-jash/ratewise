import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In - RateWise',
  description: 'Sign in to your RateWise account',
}

export default async function LoginPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-primary">RateWise</h1>
        </Link>
        <p className="text-muted-foreground mt-2">Smart Financial Calculations</p>
      </div>
      <LoginForm />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/supabase/server'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - RateWise',
  description: 'Create your RateWise account',
}

export default async function SignupPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-primary">RateWise</h1>
        </Link>
        <p className="text-muted-foreground mt-2">Smart Financial Calculations</p>
      </div>
      <SignupForm />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="underline hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Handle different callback types
      if (type === 'recovery') {
        // Password reset flow
        return NextResponse.redirect(`${origin}/update-password`)
      }
      
      if (type === 'signup') {
        // Email confirmation flow
        return NextResponse.redirect(`${origin}/signup/confirmed`)
      }
      
      // Default: redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Error exchanging code for session:', error)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

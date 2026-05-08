import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('billing_address')
      .eq('id', user.id)
      .single()

    const customerId = userData?.billing_address?.stripe_customer_id

    if (!customerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    const { returnUrl } = await req.json().catch(() => ({}))

    // Create portal session
    const session = await createPortalSession({
      customerId,
      returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

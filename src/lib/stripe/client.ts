import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  })

  if (error) {
    throw error
  }
}

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper to format interval
export function formatInterval(
  interval: string | null,
  intervalCount: number | null
): string {
  if (!interval) return ''
  
  const count = intervalCount || 1
  const plural = count > 1 ? 's' : ''
  
  return `/${count === 1 ? '' : count + ' '}${interval}${plural}`
}

// Price display helper
export function getPriceDisplay(
  unitAmount: number | null,
  currency: string = 'usd',
  interval: string | null = null,
  intervalCount: number | null = null
): string {
  if (unitAmount === null) return 'Free'
  
  const formattedAmount = formatCurrency(unitAmount, currency)
  
  if (interval) {
    return `${formattedAmount}${formatInterval(interval, intervalCount)}`
  }
  
  return formattedAmount
}

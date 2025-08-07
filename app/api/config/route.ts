import { NextResponse } from 'next/server'
import { getFreeGamesLimit, isSubscriptionEnabled } from '@/lib/config'

export async function GET() {
  try {
    return NextResponse.json({
      freeGamesPerMonth: getFreeGamesLimit(),
      subscriptionEnabled: isSubscriptionEnabled(),
    })
  } catch (error) {
    console.error('Config fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
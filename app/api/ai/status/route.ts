import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const isEnabled = !!apiKey && apiKey !== 'your-gemini-api-key-here'
    
    console.log('🤖 AI Status Check:', { 
      hasKey: !!apiKey, 
      isPlaceholder: apiKey === 'your-gemini-api-key-here',
      isEnabled 
    })
    
    return NextResponse.json({
      enabled: isEnabled,
      configured: !!apiKey,
    })
  } catch (error) {
    console.error('AI status check error:', error)
    return NextResponse.json(
      { enabled: false, configured: false },
      { status: 500 }
    )
  }
}
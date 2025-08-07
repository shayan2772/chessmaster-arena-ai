import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
// Current working Gemini API models (verified available)
const POSSIBLE_MODELS = [
  'gemini-2.0-flash',           // Latest and fastest
  'gemini-1.5-flash-latest',   // Stable and fast
  'gemini-1.5-pro-latest',     // More capable
  'gemini-1.5-flash',          // Reliable fallback
  'gemini-1.5-pro',            // Capable fallback
]

const GEMINI_MODEL = POSSIBLE_MODELS[0] // Start with the most recent
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

async function makeGeminiRequest(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    throw new Error('Gemini API key not configured')
  }

  // Try different models in order of preference
  for (let i = 0; i < POSSIBLE_MODELS.length; i++) {
    const model = POSSIBLE_MODELS[i]
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    
    try {
      console.log(`🤖 Trying Gemini chat model: ${model}`)
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (response.ok) {
        const data: GeminiResponse = await response.json()
        const result = data.candidates[0]?.content?.parts[0]?.text || 'No response generated'
        console.log(`✅ Chat success with model: ${model}`)
        return result
      } else {
        const errorText = await response.text()
        console.log(`❌ Chat model ${model} failed:`, response.status)
        
        // If this is the last model, throw the error
        if (i === POSSIBLE_MODELS.length - 1) {
          try {
            const errorData = JSON.parse(errorText)
            throw new Error(`All models failed. Last error: ${errorData.error?.message || response.status}`)
          } catch {
            throw new Error(`All models failed. Last error: ${response.status} - ${errorText}`)
          }
        }
      }
    } catch (error) {
      console.log(`❌ Chat model ${model} error:`, error)
      if (i === POSSIBLE_MODELS.length - 1) {
        throw error
      }
    }
  }
  
  throw new Error('All Gemini models failed')
}

export async function POST(request: NextRequest) {
  try {
    const { message, fen, moves, playerColor } = await request.json()

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return NextResponse.json(
        { error: 'AI chat not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 503 }
      )
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create contextual prompt for chess AI assistant
    const contextPrompt = `
You are a helpful chess AI assistant. The user asked: "${message}"

Current game context:
- Position (FEN): ${fen || 'Not provided'}
- Recent moves: ${moves ? moves.slice(-5).join(', ') : 'None'}
- User is playing as: ${playerColor || 'Unknown'}

Provide a helpful, concise response related to chess or the current game. Keep responses under 100 words and be educational.
`

    const result = await makeGeminiRequest(contextPrompt)
    
    return NextResponse.json({ 
      success: true, 
      response: result
    })

  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'AI chat failed' },
      { status: 500 }
    )
  }
}
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
      console.log(`🤖 Trying Gemini model: ${model}`)
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
        console.log(`✅ Success with model: ${model}`)
        return result
      } else {
        const errorText = await response.text()
        console.log(`❌ Model ${model} failed:`, response.status)
        
        // If this is the last model, throw the error
        if (i === POSSIBLE_MODELS.length - 1) {
          try {
            const errorData = JSON.parse(errorText)
            throw new Error(`All models failed. Last error: ${errorData.error?.message || response.status}`)
          } catch {
            throw new Error(`All models failed. Last error: ${response.status} - ${errorText}`)
          }
        }
        // Otherwise, continue to next model
      }
    } catch (error) {
      console.log(`❌ Model ${model} error:`, error)
      // If this is the last model, throw the error
      if (i === POSSIBLE_MODELS.length - 1) {
        throw error
      }
      // Otherwise, continue to next model
    }
  }
  
  throw new Error('All Gemini models failed')
}

export async function POST(request: NextRequest) {
  try {
    const { type, fen, moves, playerColor, lastMove, moveNumber } = await request.json()

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return NextResponse.json(
        { error: 'AI features not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 503 }
      )
    }

    let prompt = ''
    
    switch (type) {
      case 'analyze':
        prompt = `
You are a chess grandmaster analyzing a chess position. 

Current position (FEN): ${fen}
Recent moves: ${moves.slice(-10).join(', ')}

Provide a brief analysis (2-3 sentences) covering:
1. Who has the advantage and why
2. Key tactical or strategic themes
3. Suggested next moves or plans

Keep it concise and educational for intermediate players.
`
        break

      case 'suggest':
        if (!playerColor) {
          return NextResponse.json({ error: 'Player color required for suggestions' }, { status: 400 })
        }
        prompt = `
You are a chess engine providing move suggestions.

Current position (FEN): ${fen}
Playing as: ${playerColor}

Suggest 3 good moves for ${playerColor} in this position. Format as:
1. [Move] - [Brief explanation]
2. [Move] - [Brief explanation] 
3. [Move] - [Brief explanation]

Use standard algebraic notation (e.g., Nf3, Bxf7+, O-O).
`
        break

      case 'opening':
        if (!moves || moves.length === 0) {
          return NextResponse.json({ error: 'No moves provided for opening analysis' }, { status: 400 })
        }
        prompt = `
Analyze this chess opening:

Moves: ${moves.slice(0, 10).join(' ')}

Provide:
1. Opening name (if known)
2. Brief description of the opening's characteristics
3. Typical plans for both sides

Keep it concise (2-3 sentences).
`
        break

      case 'tip':
        prompt = `
Provide a helpful chess tip for intermediate players.

Make it:
- Practical and actionable
- Easy to remember
- Applicable in games

Format as a single, clear tip with a brief explanation.
`
        break

      case 'explain':
        if (!lastMove || !moveNumber) {
          return NextResponse.json({ error: 'Move and move number required for explanation' }, { status: 400 })
        }
        prompt = `
Explain this chess move in simple terms:

Move ${moveNumber}: ${lastMove}
Position after move (FEN): ${fen}

Provide a 1-2 sentence explanation of:
- What this move accomplishes
- Why it might be good or bad

Keep it educational and easy to understand.
`
        break

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    const result = await makeGeminiRequest(prompt)
    
    return NextResponse.json({ 
      success: true, 
      analysis: result,
      type 
    })

  } catch (error: any) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'AI analysis failed' },
      { status: 500 }
    )
  }
}
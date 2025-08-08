import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, event, data } = await request.json()

    // Store the event in database for other clients to poll
    await supabaseAdmin
      .from('realtime_events')
      .insert({
        room_id: roomId,
        user_id: userId,
        event_type: event,
        event_data: JSON.stringify(data),
        created_at: new Date().toISOString()
      })

    // Handle specific events
    if (event === 'make-move') {
      // Update game state in database
      const { move } = data
      
      const { data: game } = await supabaseAdmin
        .from('games')
        .select('moves, current_turn')
        .eq('room_id', roomId)
        .single()

      if (game) {
        const moves = JSON.parse(game.moves || '[]')
        moves.push(move)
        
        const newTurn = game.current_turn === 'white' ? 'black' : 'white'
        
        await supabaseAdmin
          .from('games')
          .update({
            moves: JSON.stringify(moves),
            board_state: move.fen,
            current_turn: newTurn,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Realtime emit error:', error)
    return NextResponse.json({ error: 'Failed to emit event' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, event, data } = await request.json()
    console.log('📤 Emit API received:', { roomId, userId, event, data })

    // Store the event in database for other clients to poll
    const { error: insertError } = await supabaseAdmin
      .from('realtime_events')
      .insert({
        room_id: roomId,
        user_id: userId,
        event_type: event,
        event_data: JSON.stringify(data),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('📤 Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to store event' }, { status: 500 })
    }

    // Handle specific events
    if (event === 'make-move') {
      console.log('📤 Processing move:', data)
      // Update game state in database
      const { move } = data
      
      const { data: game, error: gameError } = await supabaseAdmin
        .from('games')
        .select('moves, current_turn')
        .eq('room_id', roomId)
        .single()

      if (gameError) {
        console.error('📤 Game fetch error:', gameError)
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      if (game) {
        const moves = JSON.parse(game.moves || '[]')
        moves.push(move)
        
        const newTurn = game.current_turn === 'white' ? 'black' : 'white'
        console.log('📤 Updating game:', { newTurn, movesCount: moves.length })
        
        const { error: updateError } = await supabaseAdmin
          .from('games')
          .update({
            moves: JSON.stringify(moves),
            board_state: move.fen,
            current_turn: newTurn,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId)

        if (updateError) {
          console.error('📤 Game update error:', updateError)
          return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Realtime emit error:', error)
    return NextResponse.json({ error: 'Failed to emit event' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const { roomId } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Find the game
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game is available to join
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game is not available to join' },
        { status: 400 }
      )
    }

    // Check if user is already in the game
    if (game.white_player_id === payload.userId) {
      return NextResponse.json(
        { error: 'You are already the white player in this game' },
        { status: 400 }
      )
    }

    // Join as black player
    const { data: updatedGame, error: updateError } = await supabaseAdmin
      .from('games')
      .update({
        black_player_id: payload.userId,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .select()
      .single()

    if (updateError) {
      console.error('Game join error:', updateError)
      return NextResponse.json(
        { error: 'Failed to join game' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully joined game',
      roomId: updatedGame.room_id,
      game: {
        id: updatedGame.id,
        roomId: updatedGame.room_id,
        status: updatedGame.status,
        whitePlayerId: updatedGame.white_player_id,
        blackPlayerId: updatedGame.black_player_id,
        currentTurn: updatedGame.current_turn,
        boardState: updatedGame.board_state,
        moves: JSON.parse(updatedGame.moves || '[]'),
        startedAt: updatedGame.started_at
      }
    })
  } catch (error) {
    console.error('Game join error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
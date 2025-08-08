import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get game with player details
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .select(`
        *,
        white_player:users!white_player_id(id, username, name, avatar),
        black_player:users!black_player_id(id, username, name, avatar)
      `)
      .eq('room_id', params.roomId)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if user is authorized to view this game
    const isPlayer = game.white_player_id === payload.userId || 
                    game.black_player_id === payload.userId
    const isWaitingGame = game.status === 'waiting'

    if (!isPlayer && !isWaitingGame) {
      return NextResponse.json({ error: 'Unauthorized to view this game' }, { status: 403 })
    }

    return NextResponse.json({
      game: {
        id: game.id,
        roomId: game.room_id,
        status: game.status,
        result: game.result,
        whitePlayerId: game.white_player_id,
        blackPlayerId: game.black_player_id,
        whitePlayer: game.white_player,
        blackPlayer: game.black_player,
        currentTurn: game.current_turn,
        boardState: game.board_state,
        moves: game.moves,
        createdAt: game.created_at,
        startedAt: game.started_at,
        endedAt: game.ended_at,
        videoRoomUrl: game.video_room_url
      }
    })
  } catch (error) {
    console.error('Game fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
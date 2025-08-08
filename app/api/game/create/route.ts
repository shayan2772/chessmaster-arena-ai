import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getFreeGamesLimit } from '@/lib/config'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has games remaining this month
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('games_played_this_month, subscription_status, last_game_date')
      .eq('id', payload.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check game limit (free games per month unless subscribed)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const lastGameDate = user.last_game_date ? new Date(user.last_game_date) : null
    const isNewMonth = !lastGameDate || 
      lastGameDate.getMonth() !== currentMonth || 
      lastGameDate.getFullYear() !== currentYear

    let gamesPlayedThisMonth = user.games_played_this_month

    if (isNewMonth) {
      // Reset monthly counter
      gamesPlayedThisMonth = 0
      await supabaseAdmin
        .from('users')
        .update({ games_played_this_month: 0 })
        .eq('id', payload.userId)
    }

    const freeGamesLimit = getFreeGamesLimit()
    const hasSubscription = user.subscription_status === 'active'
    const canPlayGame = hasSubscription || gamesPlayedThisMonth < freeGamesLimit

    if (!canPlayGame) {
      return NextResponse.json(
        { 
          error: 'Game limit reached',
          message: `You have reached your limit of ${freeGamesLimit} free games per month. Please upgrade to play more.`
        },
        { status: 403 }
      )
    }

    // Create new game
    const roomId = uuidv4()
    
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .insert({
        room_id: roomId,
        white_player_id: payload.userId,
        status: 'waiting',
        current_turn: 'white',
        board_state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: '[]'
      })
      .select()
      .single()

    if (gameError) {
      console.error('Game creation error:', gameError)
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      )
    }

    // Update user's game count and last game date
    await supabaseAdmin
      .from('users')
      .update({
        games_played_this_month: gamesPlayedThisMonth + 1,
        last_game_date: now.toISOString()
      })
      .eq('id', payload.userId)

    return NextResponse.json({
      message: 'Game created successfully',
      roomId: game.room_id,
      game: {
        id: game.id,
        roomId: game.room_id,
        status: game.status,
        whitePlayerId: game.white_player_id,
        blackPlayerId: game.black_player_id,
        currentTurn: game.current_turn,
        boardState: game.board_state,
        moves: JSON.parse(game.moves || '[]'),
        createdAt: game.created_at
      }
    })
  } catch (error) {
    console.error('Game creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
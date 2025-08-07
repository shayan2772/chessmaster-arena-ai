import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
    const game = await prisma.game.findUnique({
      where: { roomId },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (game.status !== 'waiting') {
      return NextResponse.json({ error: 'Game is not available to join' }, { status: 400 })
    }

    // Check if user is already in the game
    if (game.whitePlayerId === payload.userId) {
      return NextResponse.json({
        gameId: game.id,
        roomId: game.roomId,
        playerColor: 'white',
      })
    }

    if (game.blackPlayerId === payload.userId) {
      return NextResponse.json({
        gameId: game.id,
        roomId: game.roomId,
        playerColor: 'black',
      })
    }

    // Join as black player if slot is available
    if (!game.blackPlayerId) {
      const updatedGame = await prisma.game.update({
        where: { id: game.id },
        data: {
          blackPlayerId: payload.userId,
          status: 'active',
          startedAt: new Date(),
        }
      })

      return NextResponse.json({
        gameId: updatedGame.id,
        roomId: updatedGame.roomId,
        playerColor: 'black',
      })
    }

    return NextResponse.json({ error: 'Game is full' }, { status: 400 })
  } catch (error) {
    console.error('Game join error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
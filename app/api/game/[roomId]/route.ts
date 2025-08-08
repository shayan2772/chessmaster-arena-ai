import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    // Import prisma dynamically to avoid build-time issues
    const { prisma } = await import('@/lib/db')
    
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    let game = await prisma.game.findUnique({
      where: { roomId: params.roomId },
      include: {
        whitePlayer: {
          select: { id: true, username: true, name: true }
        },
        blackPlayer: {
          select: { id: true, username: true, name: true }
        }
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Auto-join as black player if slot is available and user is not already in game
    if (!game.blackPlayerId && game.whitePlayerId !== payload.userId && game.status === 'waiting') {
      game = await prisma.game.update({
        where: { id: game.id },
        data: {
          blackPlayerId: payload.userId,
          status: 'active',
          startedAt: new Date(),
        },
        include: {
          whitePlayer: {
            select: { id: true, username: true, name: true }
          },
          blackPlayer: {
            select: { id: true, username: true, name: true }
          }
        }
      })
    }

    // Determine player color
    let playerColor: 'white' | 'black' | 'spectator' = 'spectator'
    if (game.whitePlayerId === payload.userId) {
      playerColor = 'white'
    } else if (game.blackPlayerId === payload.userId) {
      playerColor = 'black'
    }

    return NextResponse.json({
      game: {
        id: game.id,
        roomId: game.roomId,
        status: game.status,
        result: game.result,
        currentTurn: game.currentTurn,
        boardState: game.boardState,
        moves: JSON.parse(game.moves || '[]'),
        whitePlayer: game.whitePlayer,
        blackPlayer: game.blackPlayer,
        videoRoomUrl: game.videoRoomUrl,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
      },
      playerColor,
      userId: payload.userId,
    })
  } catch (error) {
    console.error('Game fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
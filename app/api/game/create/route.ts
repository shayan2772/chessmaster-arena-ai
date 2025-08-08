import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getFreeGamesLimit } from '@/lib/config'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
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

    // Check if user has games remaining this month
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check game limit (1 free game per month unless subscribed)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const lastGameDate = user.lastGameDate
    const isNewMonth = !lastGameDate || 
      lastGameDate.getMonth() !== currentMonth || 
      lastGameDate.getFullYear() !== currentYear

    if (isNewMonth) {
      // Reset monthly counter
      await prisma.user.update({
        where: { id: user.id },
        data: { gamesPlayedThisMonth: 0 }
      })
    }

    const freeGamesLimit = getFreeGamesLimit()
    const hasSubscription = user.subscriptionStatus === 'active'
    const canPlayGame = hasSubscription || user.gamesPlayedThisMonth < freeGamesLimit

    if (!canPlayGame) {
      return NextResponse.json(
        { error: `Monthly game limit reached (${freeGamesLimit} free games). Please subscribe for unlimited games.` },
        { status: 403 }
      )
    }

    // Create game room
    const roomId = uuidv4()
    
    const game = await prisma.game.create({
      data: {
        roomId,
        whitePlayerId: payload.userId,
        status: 'waiting',
        videoRoomUrl: null, // Using custom WebRTC, no external URL needed
      }
    })

    // Update user's game count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gamesPlayedThisMonth: user.gamesPlayedThisMonth + 1,
        lastGameDate: now,
      }
    })

    return NextResponse.json({
      gameId: game.id,
      roomId: game.roomId,
      playerColor: 'white',
    })
  } catch (error) {
    console.error('Game creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
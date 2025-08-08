import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')
    const lastPoll = searchParams.get('lastPoll') || new Date(Date.now() - 5000).toISOString()

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get events since last poll
    const { data: events } = await supabaseAdmin
      .from('realtime_events')
      .select('*')
      .eq('room_id', roomId)
      .neq('user_id', userId) // Don't return user's own events
      .gt('created_at', lastPoll)
      .order('created_at', { ascending: true })

    const formattedEvents = (events || []).map(event => ({
      event: event.event_type,
      data: JSON.parse(event.event_data)
    }))

    // Clean up old events (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('realtime_events')
      .delete()
      .lt('created_at', oneHourAgo)

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Realtime poll error:', error)
    return NextResponse.json({ error: 'Failed to poll events' }, { status: 500 })
  }
}
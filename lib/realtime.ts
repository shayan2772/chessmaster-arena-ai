// Serverless-compatible real-time solution using polling
export class RealtimeClient {
  private roomId: string
  private userId: string
  private playerColor: string
  private pollInterval: NodeJS.Timeout | null = null
  private listeners: { [key: string]: Function[] } = {}

  constructor(roomId: string, userId: string, playerColor: string) {
    this.roomId = roomId
    this.userId = userId
    this.playerColor = playerColor
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string, data: any) {
    // Send event to server via API
    fetch('/api/realtime/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.roomId,
        userId: this.userId,
        event,
        data
      })
    }).catch(console.error)
  }

  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  connect() {
    console.log('🔌 Connecting to realtime service...')
    this.trigger('connect', {})
    
    // Start polling for updates
    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/realtime/poll?roomId=${this.roomId}&userId=${this.userId}`)
        if (response.ok) {
          const events = await response.json()
          events.forEach((eventData: any) => {
            this.trigger(eventData.event, eventData.data)
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000) // Poll every second
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.trigger('disconnect', {})
  }
}
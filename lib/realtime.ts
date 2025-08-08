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
    console.log('📤 Emitting event:', event, 'Data:', data)
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
    })
    .then(response => {
      console.log('📤 Emit response:', response.status)
      return response.json()
    })
    .then(result => {
      console.log('📤 Emit result:', result)
    })
    .catch(error => {
      console.error('📤 Emit error:', error)
    })
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
          if (events.length > 0) {
            console.log('📥 Received events:', events)
          }
          events.forEach((eventData: any) => {
            console.log('📥 Triggering event:', eventData.event, 'Data:', eventData.data)
            this.trigger(eventData.event, eventData.data)
          })
        } else {
          console.error('📥 Poll failed:', response.status)
        }
      } catch (error) {
        console.error('📥 Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.trigger('disconnect', {})
  }
}
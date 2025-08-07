'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { GameMove } from '@/lib/chess-utils'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AIChatProps {
  gameState: {
    fen: string
    currentTurn: 'white' | 'black'
    moves: GameMove[]
  }
  playerColor: 'white' | 'black' | 'spectator'
}

export default function AIChat({ gameState, playerColor }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI chess assistant. Ask me about the position, request move suggestions, or get chess tips!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check AI status on component mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai/status')
        const data = await response.json()
        setAiEnabled(data.enabled)
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setAiEnabled(false)
      }
    }
    
    checkAIStatus()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || aiEnabled === false) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setLoading(true)

    try {
      const moveNotations = gameState.moves.map(move => move.san)
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          fen: gameState.fen,
          moves: moveNotations,
          playerColor: playerColor
        })
      })

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.success ? data.response : (data.error || "Sorry, I'm having trouble right now."),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (aiEnabled === false) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">AI Chat</h3>
          <p className="text-gray-400 text-sm">Configure Gemini API key to chat with AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col h-96">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-green-400" />
          <h3 className="font-semibold text-white">AI Chess Coach</h3>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-300'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'ai' ? (
                  <img
                    src="https://ui-avatars.com/api/?name=AI+Coach&size=16&background=10B981&color=FFFFFF&rounded=true&bold=true"
                    alt="AI Coach"
                    className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                  />
                ) : (
                  <img
                    src="https://ui-avatars.com/api/?name=You&size=16&background=3B82F6&color=FFFFFF&rounded=true&bold=true"
                    alt="You"
                    className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                  />
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
              <div className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-green-400" />
                <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
                <span className="text-gray-300 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the position, request hints, or get chess tips..."
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            'Analyze position',
            'Suggest moves',
            'Explain opening',
            'Chess tip'
          ].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setInput(action)}
              className="text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
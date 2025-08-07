'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { GameMove } from '@/lib/chess-utils'

interface MoveExplainerProps {
  lastMove: GameMove | null
  fen: string
  moveNumber: number
}

export default function MoveExplainer({ lastMove, fen, moveNumber }: MoveExplainerProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null)

  // Check AI status on component mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai/status')
        const data = await response.json()
        setAiEnabled(data.enabled)
      } catch (error) {
        setAiEnabled(false)
      }
    }
    
    checkAIStatus()
  }, [])

  useEffect(() => {
    if (lastMove && aiEnabled === true) {
      setVisible(true)
      explainMove()
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setVisible(false)
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [lastMove, fen, aiEnabled])

  const explainMove = async () => {
    if (!lastMove || aiEnabled === false) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'explain',
          fen: fen,
          lastMove: lastMove.san,
          moveNumber: moveNumber
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setExplanation(data.analysis)
      } else {
        setExplanation('Move explanation temporarily unavailable.')
      }
    } catch (error) {
      console.error('Move explanation error:', error)
      setExplanation('Move explanation temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }

  if (aiEnabled === false || !lastMove || !visible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black/90 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-2xl">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-blue-400 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white font-medium text-sm">Move {moveNumber}</span>
              <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs font-mono">
                {lastMove.san}
              </span>
            </div>
            
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                <span className="text-gray-300 text-sm">AI explaining...</span>
              </div>
            ) : (
              <p className="text-gray-300 text-sm leading-relaxed">
                {explanation}
              </p>
            )}
          </div>
          
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
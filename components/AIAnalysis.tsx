'use client'

import { useState, useEffect } from 'react'
import { Brain, Lightbulb, TrendingUp, BookOpen, Loader2 } from 'lucide-react'
import { GameMove } from '@/lib/chess-utils'

interface AIAnalysisProps {
  gameState: {
    fen: string
    currentTurn: 'white' | 'black'
    moves: GameMove[]
  }
  playerColor: 'white' | 'black' | 'spectator'
}

export default function AIAnalysis({ gameState, playerColor }: AIAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions' | 'opening' | 'tips'>('analysis')
  const [analysis, setAnalysis] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string>('')
  const [opening, setOpening] = useState<string>('')
  const [tip, setTip] = useState<string>('')
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null)

  // Check AI status on component mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai/status')
        const data = await response.json()
        setAiEnabled(data.enabled)
        console.log('🤖 AI Status from API:', data)
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setAiEnabled(false)
      }
    }
    
    checkAIStatus()
  }, [])

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'suggestions', label: 'Hints', icon: Lightbulb },
    { id: 'opening', label: 'Opening', icon: BookOpen },
    { id: 'tips', label: 'Tips', icon: TrendingUp },
  ]

  const fetchAnalysis = async () => {
    if (aiEnabled === false || loading.analysis) return
    
    setLoading(prev => ({ ...prev, analysis: true }))
    try {
      const moveNotations = gameState.moves.map(move => move.san)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze',
          fen: gameState.fen,
          moves: moveNotations
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        setAnalysis(data.error || 'AI analysis temporarily unavailable.')
      }
    } catch (error) {
      console.error('Analysis fetch error:', error)
      setAnalysis('AI analysis temporarily unavailable. Please try again later.')
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }))
    }
  }

  const fetchSuggestions = async () => {
    if (aiEnabled === false || loading.suggestions || playerColor === 'spectator') return
    
    setLoading(prev => ({ ...prev, suggestions: true }))
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest',
          fen: gameState.fen,
          playerColor: playerColor
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setSuggestions(data.analysis)
      } else {
        setSuggestions(data.error || 'Move suggestions temporarily unavailable.')
      }
    } catch (error) {
      console.error('Suggestions fetch error:', error)
      setSuggestions('Move suggestions temporarily unavailable.')
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }))
    }
  }

  const fetchOpening = async () => {
    if (aiEnabled === false || loading.opening || gameState.moves.length === 0) return
    
    setLoading(prev => ({ ...prev, opening: true }))
    try {
      const moveNotations = gameState.moves.map(move => move.san)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'opening',
          fen: gameState.fen,
          moves: moveNotations
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setOpening(data.analysis)
      } else {
        setOpening(data.error || 'Opening analysis temporarily unavailable.')
      }
    } catch (error) {
      console.error('Opening fetch error:', error)
      setOpening('Opening analysis temporarily unavailable.')
    } finally {
      setLoading(prev => ({ ...prev, opening: false }))
    }
  }

  const fetchTip = async () => {
    if (aiEnabled === false || loading.tips) return
    
    setLoading(prev => ({ ...prev, tips: true }))
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tip'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setTip(data.analysis)
      } else {
        setTip(data.error || 'Chess tips temporarily unavailable.')
      }
    } catch (error) {
      console.error('Tip fetch error:', error)
      setTip('Chess tips temporarily unavailable.')
    } finally {
      setLoading(prev => ({ ...prev, tips: false }))
    }
  }

  useEffect(() => {
    if (activeTab === 'analysis' && !analysis) {
      fetchAnalysis()
    } else if (activeTab === 'suggestions' && !suggestions) {
      fetchSuggestions()
    } else if (activeTab === 'opening' && !opening) {
      fetchOpening()
    } else if (activeTab === 'tips' && !tip) {
      fetchTip()
    }
  }, [activeTab, gameState.fen, gameState.moves.length])

  if (aiEnabled === false) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
          <p className="text-gray-400 text-sm">Configure Gemini API key to enable AI features</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    const currentLoading = loading[activeTab]
    let content = ''
    
    switch (activeTab) {
      case 'analysis':
        content = analysis
        break
      case 'suggestions':
        content = suggestions
        break
      case 'opening':
        content = opening
        break
      case 'tips':
        content = tip
        break
    }

    if (currentLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-blue-400 animate-spin mr-2" />
          <span className="text-gray-300">AI thinking...</span>
        </div>
      )
    }

    if (!content) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">Click to get AI insights</p>
        </div>
      )
    }

    return (
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">AI Assistant</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 px-2 text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px]">
        {renderContent()}
      </div>

      {/* Refresh Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => {
            switch (activeTab) {
              case 'analysis':
                fetchAnalysis()
                break
              case 'suggestions':
                fetchSuggestions()
                break
              case 'opening':
                fetchOpening()
                break
              case 'tips':
                fetchTip()
                break
            }
          }}
          disabled={loading[activeTab]}
          className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading[activeTab] ? 'Analyzing...' : 'Refresh AI Analysis'}
        </button>
      </div>
    </div>
  )
}
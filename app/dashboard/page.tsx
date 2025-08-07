'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserAvatar } from '@/lib/avatar'
import { Play, Users, Crown, LogOut, Plus, Hash, Trophy, Zap, Bot, Star, Sparkles, Gamepad2, Target, Shield } from 'lucide-react'

// Gaming SVG Components
const ChessKnightSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M20 80 L25 75 L30 70 L35 65 L40 60 L45 55 L50 50 L55 45 L60 40 L65 35 L70 30 L75 25 L80 20 L75 15 L70 20 L65 25 L60 30 L55 35 L50 40 L45 45 L40 50 L35 55 L30 60 L25 65 L20 70 Z" 
          fill="currentColor" opacity="0.8"/>
    <circle cx="65" cy="25" r="8" fill="currentColor"/>
    <path d="M15 85 L85 85 L80 80 L20 80 Z" fill="currentColor"/>
  </svg>
)

function JoinGameForm() {
  const [roomId, setRoomId] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) return

    setIsJoining(true)
    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomId.trim() }),
      })

      const data = await response.json()
      
      if (response.ok) {
        router.push(`/game/${data.roomId}`)
      } else {
        alert(data.error || 'Failed to join game')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <form onSubmit={handleJoinGame} className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Hash className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
          required
        />
      </div>
      <button 
        type="submit"
        disabled={isJoining || !roomId.trim()}
        className="group w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
      >
        <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        {isJoining ? 'Joining Arena...' : 'Join Battle'}
      </button>
    </form>
  )
}

interface User {
  id: string
  email: string
  username: string
  name: string
  gamesPlayedThisMonth: number
  subscriptionStatus: string | null
}

interface AppConfig {
  freeGamesPerMonth: number
  subscriptionEnabled: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [config, setConfig] = useState<AppConfig>({ freeGamesPerMonth: 1, subscriptionEnabled: false })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchConfig()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const configData = await response.json()
        setConfig(configData)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const handleCreateGame = async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        router.push(`/game/${data.roomId}`)
      } else {
        alert(data.error || 'Failed to create game')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-10 h-10 text-white">
              <ChessKnightSVG />
            </div>
          </div>
          <div className="text-white font-semibold">Loading your arena...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasSubscription = user.subscriptionStatus === 'active'
  const gamesRemaining = hasSubscription ? '∞' : Math.max(0, config.freeGamesPerMonth - user.gamesPlayedThisMonth)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 text-purple-400">
                <ChessKnightSVG />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  ChessMaster Arena
                </h1>
                <p className="text-xs text-gray-400">Elite Gaming Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img
                  src={getUserAvatar(user.name, 40)}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-400/50"
                />
                <div>
                  <div className="text-white font-semibold">Welcome back, {user.name}!</div>
                  <div className="text-xs text-gray-400">@{user.username}</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{user.gamesPlayedThisMonth}</div>
            <div className="text-sm text-gray-400">Games This Month</div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-900/50 to-slate-900/50 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{gamesRemaining}</div>
            <div className="text-sm text-gray-400">Games Remaining</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/50 to-slate-900/50 p-6 rounded-2xl border border-yellow-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {hasSubscription ? 'Elite' : 'Rookie'}
            </div>
            <div className="text-sm text-gray-400">Player Tier</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-gray-400">Master Coach Active</div>
          </div>
        </div>

        {/* Game Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Create Game */}
          <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Create Battle</h3>
                <p className="text-gray-400">Start a new chess arena</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Launch a new chess battle with HD video chat. Share your room code with opponents and dominate the board with ChessMaster coaching support.
            </p>
            
            <button
              onClick={handleCreateGame}
              disabled={!hasSubscription && user.gamesPlayedThisMonth >= config.freeGamesPerMonth}
              className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <Gamepad2 className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              {!hasSubscription && user.gamesPlayedThisMonth >= config.freeGamesPerMonth ? 'Upgrade to Play' : 'Launch Arena'}
            </button>
            
            {!hasSubscription && user.gamesPlayedThisMonth >= config.freeGamesPerMonth && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">
                  Monthly limit reached ({config.freeGamesPerMonth} free games). Upgrade to Elite for unlimited battles.
                </p>
              </div>
            )}
          </div>

          {/* Join Game */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900/30 p-8 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Join Battle</h3>
                <p className="text-gray-400">Enter an existing arena</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Got a room code from a fellow master? Enter it below to join their ChessMaster Arena and begin your legendary duel.
            </p>
            
            <JoinGameForm />
          </div>
        </div>

        {/* Premium Upgrade CTA */}
        {!hasSubscription && config.subscriptionEnabled && (
          <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-cyan-900/50 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mr-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ascend to Elite Tier</h3>
                  <p className="text-gray-300 max-w-md">
                    Unlock unlimited battles, priority ChessMaster coaching, exclusive features, and join the ranks of chess legends.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
                    Unlimited Games
                  </div>
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-1 text-cyan-400" />
                    Priority Coaching
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-purple-400" />
                    Exclusive Features
                  </div>
                </div>
                
                <Link
                  href="/subscription"
                  className="group bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 flex items-center transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  <Crown className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Upgrade to Elite
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-black/20 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400 mb-1">10K+</div>
            <div className="text-xs text-gray-400">Active Players</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-cyan-400 mb-1">50K+</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400 mb-1">99.9%</div>
            <div className="text-xs text-gray-400">Uptime</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-cyan-400 mb-1">&lt;100ms</div>
            <div className="text-xs text-gray-400">Latency</div>
          </div>
        </div>
      </main>
    </div>
  )
}
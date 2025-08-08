'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import ChessBoard from '@/components/ChessBoard'
import SimpleVideoChat from '@/components/SimpleVideoChat'
import AIAnalysis from '@/components/AIAnalysis'
import MoveExplainer from '@/components/MoveExplainer'
import AIChat from '@/components/AIChat'
import { GameMove } from '@/lib/chess-utils'
import { getPlayerAvatar } from '@/lib/avatar'
import { Copy, Users, Crown, Clock, Trophy, Brain } from 'lucide-react'

interface GameData {
  id: string
  roomId: string
  status: string
  currentTurn: 'white' | 'black'
  boardState: string
  moves: GameMove[]
  whitePlayer?: { id: string; username: string; name: string }
  blackPlayer?: { id: string; username: string; name: string }
  videoRoomUrl?: string
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('spectator')
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [showAIPanel, setShowAIPanel] = useState(false)

  useEffect(() => {
    fetchGameData()
  }, [roomId])

  useEffect(() => {
    if (currentUserId && playerColor !== 'spectator') {
      initializeSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [currentUserId, playerColor])

  const fetchGameData = async () => {
    try {
      console.log('🎮 Fetching game data for room:', roomId)
      console.log('🔍 Params object:', params)
      console.log('🔍 RoomId type:', typeof roomId, 'Value:', roomId)
      
      if (!roomId || roomId === 'undefined') {
        console.error('❌ Invalid roomId:', roomId)
        router.push('/dashboard')
        return
      }
      
      const response = await fetch(`/api/game/${roomId}`)
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎯 Game data received:', data)
        setGameData(data.game)
        setPlayerColor(data.playerColor)
        setCurrentUserId(data.userId)
        console.log('👤 Player color:', data.playerColor, 'User ID:', data.userId)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch game data:', response.status, errorData)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Failed to fetch game data:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeSocket = () => {
    const newSocket = io()
    
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected, joining game with userId:', currentUserId, 'color:', playerColor)
      setConnectionStatus('Connected')
      newSocket.emit('join-game', {
        roomId,
        userId: currentUserId,
        playerColor,
      })
    })

    newSocket.on('disconnect', () => {
      setConnectionStatus('Disconnected')
    })

    newSocket.on('game-state', (gameState) => {
      setGameData(prev => prev ? { ...prev, ...gameState } : null)
    })

    newSocket.on('move-made', ({ move, gameState }) => {
      console.log('♟️ Move received:', move, 'New state:', gameState)
      setGameData(prev => prev ? { 
        ...prev, 
        boardState: gameState.fen,
        currentTurn: gameState.currentTurn,
        moves: gameState.moves
      } : null)
    })

    newSocket.on('player-joined', ({ userId, playerColor: joinedColor }) => {
      setConnectionStatus(`Player joined as ${joinedColor}`)
      fetchGameData() // Refresh game data
    })

    newSocket.on('player-left', () => {
      setConnectionStatus('Player left')
    })

    setSocket(newSocket)
  }

  const handleMove = (move: GameMove) => {
    if (socket && gameData) {
      console.log('🎯 Making move:', move)
      socket.emit('make-move', {
        roomId,
        move
      })
    }
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/game/${roomId}`
    navigator.clipboard.writeText(link)
    alert('Room link copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400/20 border-t-amber-400 mx-auto mb-6"></div>
            <Crown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Chess Arena</h2>
          <p className="text-gray-400">Preparing your game...</p>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <Crown className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Game Not Found</h2>
            <p className="text-gray-400 mb-6">The game room you're looking for doesn't exist or has ended.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modern Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-7 w-7 text-amber-400" />
                <h1 className="text-xl font-bold text-white">Chess Arena</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-300">{connectionStatus}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showAIPanel 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Coach</span>
              </button>
              <button
                onClick={copyRoomLink}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Share Room</span>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 relative">
          {/* Left Sidebar - Player Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Players */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
              
              {/* Black Player (Top) */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  {gameData.blackPlayer ? (
                    <img
                      src={getPlayerAvatar(gameData.blackPlayer.name, 'black', 32)}
                      alt={gameData.blackPlayer.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
                      <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {gameData.blackPlayer?.name || 'Waiting...'}
                    </p>
                    <p className="text-xs text-gray-400">Black</p>
                  </div>
                </div>
                {gameData.currentTurn === 'black' && (
                  <div className="text-xs text-amber-400 font-medium flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2"></div>
                    Thinking...
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="text-center py-2">
                <span className="text-gray-500 text-sm font-bold">VS</span>
              </div>

              {/* White Player (Bottom) */}
              <div className="mt-6">
                <div className="flex items-center space-x-3 mb-2">
                  {gameData.whitePlayer ? (
                    <img
                      src={getPlayerAvatar(gameData.whitePlayer.name, 'white', 32)}
                      alt={gameData.whitePlayer.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {gameData.whitePlayer?.name || 'Waiting...'}
                    </p>
                    <p className="text-xs text-gray-400">White</p>
                  </div>
                </div>
                {gameData.currentTurn === 'white' && (
                  <div className="text-xs text-amber-400 font-medium flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2"></div>
                    Thinking...
                  </div>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Game Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white capitalize">{gameData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Turn</span>
                  <span className="text-white capitalize">{gameData.currentTurn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Moves</span>
                  <span className="text-white">{gameData.moves.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chess Board - Center */}
          <div className="xl:col-span-3">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              {playerColor !== 'spectator' ? (
                <div className="relative">
                  {/* Your Turn Indicator */}
                  {gameData.currentTurn === playerColor && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-sm font-medium z-10">
                      Your Turn
                    </div>
                  )}
                  
                  <ChessBoard
                    gameId={gameData.id}
                    playerColor={playerColor}
                    onMove={handleMove}
                    gameState={{
                      fen: gameData.boardState,
                      currentTurn: gameData.currentTurn,
                      moves: gameData.moves,
                    }}
                  />
                  
                  {/* Player Color Indicator */}
                  <div className="mt-4 text-center">
                    <span className="text-gray-300 text-sm">
                      You are playing as{' '}
                      <span className={`font-semibold ${playerColor === 'white' ? 'text-white' : 'text-gray-400'}`}>
                        {playerColor}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Users className="h-20 w-20 text-gray-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Spectating Game</h3>
                  <p className="text-gray-400">You are watching this game as a spectator.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Video Chat & Moves */}
          <div className="xl:col-span-1 space-y-6">
            {/* Video Chat */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Video Chat</h3>
              </div>
              {socket && currentUserId ? (
                <SimpleVideoChat
                  socket={socket}
                  roomId={roomId}
                  userId={currentUserId}
                  onLeave={() => console.log('Left video chat')}
                />
              ) : (
                <div className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-400 text-sm">Initializing video...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Move History */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Move History</h3>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {gameData.moves.length > 0 ? (
                  <div className="space-y-2">
                    {gameData.moves.map((move, index) => {
                      const player = move.player === 'white' ? gameData.whitePlayer : gameData.blackPlayer
                      return (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-400 w-6">{Math.floor(index / 2) + 1}.</span>
                          
                          {player && (
                            <img
                              src={getPlayerAvatar(player.name, move.player, 16)}
                              alt={player.name}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          
                          <span className="font-mono text-white bg-gray-800/50 px-2 py-1 rounded flex-1 text-center">
                            {move.san}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">No moves yet</div>
                    <div className="text-gray-600 text-xs mt-1">Game will begin soon...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Panel - Floating Overlay */}
          {showAIPanel && (
            <div className="fixed top-20 right-6 w-96 h-[calc(100vh-8rem)] z-40 space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="h-1/2">
                <AIAnalysis 
                  gameState={{
                    fen: gameData.boardState,
                    currentTurn: gameData.currentTurn,
                    moves: gameData.moves,
                  }}
                  playerColor={playerColor}
                />
              </div>
              
              <div className="h-1/2">
                <AIChat
                  gameState={{
                    fen: gameData.boardState,
                    currentTurn: gameData.currentTurn,
                    moves: gameData.moves,
                  }}
                  playerColor={playerColor}
                />
              </div>
            </div>
          )}
        </div>

        {/* Move Explainer - Floating */}
        <MoveExplainer
          lastMove={gameData.moves[gameData.moves.length - 1] || null}
          fen={gameData.boardState}
          moveNumber={gameData.moves.length}
        />
      </main>
    </div>
  )
}
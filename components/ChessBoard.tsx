'use client'

import { useState, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { ChessGame, GameMove } from '@/lib/chess-utils'

interface ChessBoardProps {
  gameId: string
  playerColor: 'white' | 'black'
  onMove: (move: GameMove) => void
  gameState: {
    fen: string
    currentTurn: 'white' | 'black'
    moves: GameMove[]
  }
}

export default function ChessBoard({ gameId, playerColor, onMove, gameState }: ChessBoardProps) {
  const [game, setGame] = useState<ChessGame>(new ChessGame(gameState.fen))
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])

  useEffect(() => {
    setGame(new ChessGame(gameState.fen))
  }, [gameState.fen])

  const handleSquareClick = (square: string) => {
    // Only allow moves on player's turn
    if (gameState.currentTurn !== playerColor) return

    if (selectedSquare) {
      // Try to make a move
      if (possibleMoves.includes(square)) {
        const move = game.makeMove(selectedSquare, square)
        if (move) {
          onMove(move)
        }
      }
      setSelectedSquare(null)
      setPossibleMoves([])
    } else {
      // Select a square
      const moves = game.getPossibleMoves(square)
      if (moves.length > 0) {
        setSelectedSquare(square)
        setPossibleMoves(moves)
      }
    }
  }

  const customSquareStyles = () => {
    const styles: { [square: string]: React.CSSProperties } = {}
    
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }
    
    possibleMoves.forEach(square => {
      styles[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
    })
    
    return styles
  }

  return (
    <div className="chess-board-container">
      <div className="relative">
        <Chessboard
          position={gameState.fen}
          onSquareClick={handleSquareClick}
          boardOrientation={playerColor}
          customSquareStyles={customSquareStyles()}
          arePiecesDraggable={false}
          boardWidth={Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 100 : 600)}
          customBoardStyle={{
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
          customLightSquareStyle={{ backgroundColor: '#e2e8f0' }}
        />
        
        {/* Turn Indicator Overlay */}
        {gameState.currentTurn !== playerColor && (
          <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">Opponent's Turn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
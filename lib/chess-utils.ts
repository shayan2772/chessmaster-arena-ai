import { Chess } from 'chess.js'

export interface GameMove {
  from: string
  to: string
  promotion?: string
  san: string
  timestamp: number
  player: 'white' | 'black'
  fen?: string
}

export class ChessGame {
  private chess: Chess

  constructor(fen?: string) {
    this.chess = new Chess(fen)
  }

  makeMove(from: string, to: string, promotion?: string): GameMove | null {
    try {
      const move = this.chess.move({ from, to, promotion })
      if (move) {
        return {
          from,
          to,
          promotion,
          san: move.san,
          timestamp: Date.now(),
          player: this.chess.turn() === 'w' ? 'black' : 'white', // Previous player
          fen: this.chess.fen() // Include updated FEN
        }
      }
      return null
    } catch {
      return null
    }
  }

  isGameOver(): boolean {
    return this.chess.isGameOver()
  }

  getGameResult(): string | null {
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? 'black_wins' : 'white_wins'
    }
    if (this.chess.isDraw()) {
      return 'draw'
    }
    return null
  }

  getFen(): string {
    return this.chess.fen()
  }

  getTurn(): 'white' | 'black' {
    return this.chess.turn() === 'w' ? 'white' : 'black'
  }

  isValidMove(from: string, to: string): boolean {
    try {
      const moves = this.chess.moves({ square: from as any, verbose: true })
      return moves.some(move => move.to === to)
    } catch {
      return false
    }
  }

  getPossibleMoves(square: string): string[] {
    try {
      const moves = this.chess.moves({ square: square as any, verbose: true })
      return moves.map(move => move.to)
    } catch {
      return []
    }
  }
}
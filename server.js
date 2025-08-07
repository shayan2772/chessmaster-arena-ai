const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })

  // Game rooms management
  const gameRooms = new Map()

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-game', ({ roomId, userId, playerColor }) => {
      socket.join(roomId)
      
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          players: {},
          gameState: {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            currentTurn: 'white',
            moves: []
          },
          videoUsers: new Set()
        })
      }

      const room = gameRooms.get(roomId)
      room.players[socket.id] = { userId, playerColor, socketId: socket.id }

      // Notify other players
      socket.to(roomId).emit('player-joined', { userId, playerColor })
      
      // Send current game state
      socket.emit('game-state', room.gameState)
    })

    socket.on('make-move', ({ roomId, move }) => {
      console.log('♟️ Move received for room:', roomId, 'Move:', move)
      const room = gameRooms.get(roomId)
      if (!room) {
        console.log('❌ Room not found:', roomId)
        return
      }

      // Update game state
      room.gameState.moves.push(move)
      if (move.fen) {
        room.gameState.fen = move.fen
        console.log('📋 Updated board state:', move.fen)
      }
      room.gameState.currentTurn = room.gameState.currentTurn === 'white' ? 'black' : 'white'

      console.log('📡 Broadcasting move to room:', roomId)
      // Broadcast move to all players in room
      io.to(roomId).emit('move-made', { move, gameState: room.gameState })
    })

    // WebRTC Video Chat Signaling
    socket.on('video-ready', ({ roomId, userId }) => {
      const room = gameRooms.get(roomId)
      if (!room) return

      room.videoUsers.add(socket.id)
      
      // Notify other users in the room that this user is ready for video
      socket.to(roomId).emit('peer-joined', { peerId: socket.id, userId })
      
      // If there are other video users, notify this user about them
      room.videoUsers.forEach(existingSocketId => {
        if (existingSocketId !== socket.id) {
          socket.emit('peer-joined', { peerId: existingSocketId })
        }
      })
    })

    socket.on('webrtc-offer', ({ offer, targetId }) => {
      console.log('📨 Relaying offer from', socket.id, 'to room', socket.rooms)
      socket.to(Array.from(socket.rooms)[1]).emit('webrtc-offer', {
        offer,
        senderId: socket.id
      })
    })

    socket.on('webrtc-answer', ({ answer, targetId }) => {
      console.log('📨 Relaying answer from', socket.id)
      socket.to(Array.from(socket.rooms)[1]).emit('webrtc-answer', {
        answer,
        senderId: socket.id
      })
    })

    socket.on('webrtc-ice-candidate', ({ candidate, targetId }) => {
      console.log('🧊 Relaying ICE candidate from', socket.id)
      socket.to(Array.from(socket.rooms)[1]).emit('webrtc-ice-candidate', {
        candidate,
        senderId: socket.id
      })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      
      // Remove player from all rooms
      for (const [roomId, room] of gameRooms.entries()) {
        if (room.players[socket.id]) {
          delete room.players[socket.id]
          room.videoUsers.delete(socket.id)
          
          // Notify other players
          socket.to(roomId).emit('player-left', { socketId: socket.id })
          socket.to(roomId).emit('peer-left', { peerId: socket.id })
          
          // Clean up empty rooms
          if (Object.keys(room.players).length === 0) {
            gameRooms.delete(roomId)
          }
        }
      }
    })
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
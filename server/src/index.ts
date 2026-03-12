import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import cors from 'cors'
import 'dotenv/config'

// dotenv.config()
const app = express()
const PORT = process.env.PORT
const WSSPORT = Number(process.env.WSSPORT)

app.use(cors())

const wss = new WebSocketServer({ port: WSSPORT })

// Track users in rooms: { roomName: [{ ws, userId, name }, ...] }
const rooms: { [key: string]: { ws: WebSocket; userId: string; name: string }[] } = {}

if (wss) {
  console.log(`WebSocket Server running on ${WSSPORT}`)
}

wss.on('connection', (ws) => {
  console.log('A CLIENT IS CONNECTED')
  let currentRoom: string | null = null
  let currentUserId: string | null = null

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    console.log(`Received message type: ${msg.type}`)

    if (msg.type == 'join') {
      console.log(`${msg.name} joined the channel ${msg.channel}`)
      currentRoom = msg.channel
      currentUserId = msg.userId

      // Add user to room
      if (currentRoom) {
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = []
        }
        rooms[currentRoom].push({ ws, userId: msg.userId, name: msg.name })
        console.log(`Room ${currentRoom} now has ${rooms[currentRoom].length} users`)
      }
    }

    // Relay signaling messages (offer, answer, candidate) to other users in the same room
    if (msg.type == 'offer' || msg.type == 'answer' || msg.type == 'candidate') {
      console.log(`Relaying ${msg.type} message to other users in room ${currentRoom}`)
      if (currentRoom && rooms[currentRoom]) {
        rooms[currentRoom].forEach((user) => {
          // Send to all users in the room except the sender
          if (user.userId !== currentUserId) {
            console.log(`Sending ${msg.type} to ${user.name}`)
            user.ws.send(JSON.stringify(msg))
          }
        })
      } else {
        console.log(`ERROR: Room ${currentRoom} not found or user not in a room`)
      }
    }
  })

  ws.on('close', () => {
    console.log('A CLIENT DISCONNECTED')
    if (currentRoom && currentUserId) {
      rooms[currentRoom] = rooms[currentRoom].filter((user) => user.userId !== currentUserId)
      console.log(`User ${currentUserId} removed from room ${currentRoom}. Room now has ${rooms[currentRoom].length} users`)
    }
  })
})

app.get('/', (_req, res) => {
  res.status(200).send({ message: 'signalling server' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
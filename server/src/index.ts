import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import cors from 'cors'
import 'dotenv/config'


// dotenv.config()
const app = express()
const PORT = process.env.PORT
const WSSPORT = process.env.WSSPORT


app.use(cors())

const wss = new WebSocketServer({})


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
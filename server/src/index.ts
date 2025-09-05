import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";


const app = express();
const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  ws.on('message', (data: any) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === 'sender') {
      senderSocket = ws;
    } else if (msg.type === 'receiver') {
      receiverSocket = ws;
    } else if (msg.type === 'offer') {
      if(ws !== senderSocket) return;
      console.log('offer received');
      receiverSocket?.send(JSON.stringify({ type: 'offer', offer: msg.offer }));
    }else if(msg.type === 'answer'){
      if(ws !== receiverSocket) return;
      console.log('answer received');
      senderSocket?.send(JSON.stringify({type:'answer',answer:msg.answer}));
    }else if(msg.type === 'candidate'){
      //set ice candidtates according to the socket
      if(ws === senderSocket){
        receiverSocket?.send(JSON.stringify({type:'candidate',candidate:msg.candidate}));
      }else if(ws === receiverSocket){
        senderSocket?.send(JSON.stringify({type:'candidate',candidate:msg.candidate}));
      }
    }
  });
});


// Routes
app.get('/', (req, res) => {
  res.json({ message: 'VoiceParty Server is running!' });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



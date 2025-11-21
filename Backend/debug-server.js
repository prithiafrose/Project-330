const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Simple CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

// Basic route
app.get('/', (req, res) => {
  res.send('Chat server is running!');
});

const io = new Server(server, { 
  cors: { 
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST'],
    credentials: true
  } 
});

// Simple socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('authenticate', ({ userId }) => {
    console.log('Authenticating user:', userId);
    socket.data.userId = userId;
    socket.emit('authenticated', { userId });
  });
  
  socket.on('private_message', ({ from, to, text }) => {
    console.log('Message:', { from, to, text });
    
    // Simple bot response
    if (to === 'bot_user' && text) {
      setTimeout(() => {
        const botResponse = `I received your message: "${text}"`;
        const botMessage = {
          id: Date.now(),
          from_id: 'bot_user',
          to_id: from,
          text: botResponse,
          createdAt: new Date()
        };
        socket.emit('private_message', botMessage);
      }, 1000);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple chat server running on port ${PORT}`);
  console.log(`Test URL: http://127.0.0.1:${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
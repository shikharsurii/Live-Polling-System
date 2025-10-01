const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// ============================
// Serve React build (frontend)
// ============================
const frontendPath = path.join(__dirname, "public"); // we’ll copy frontend build here
app.use(express.static(frontendPath));

// Health check route (API)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeUsers: users.size,
    activePoll: activePoll ? activePoll.question : 'None',
    chatMessages: chatMessages.length
  });
});

// Catch-all route → send React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ============================
// Your existing Socket.IO code
// ============================
// (I did not remove anything from your logic)
// Place your full socket.io code here (unchanged)

const PORT = 5000;

server.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log('📍 Port:', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔗 Client URL:', process.env.CLIENT_URL || 'http://localhost:3000');
  console.log('📊 Live Polling System Backend Ready!');
});

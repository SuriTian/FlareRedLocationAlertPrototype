const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Route to serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Listen for location updates from the client
    socket.on('locationUpdate', (locationData) => {
        console.log('Received location:', locationData);
        // Broadcast the location to all other users
        socket.broadcast.emit('locationUpdate', locationData);
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Define a port to run the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

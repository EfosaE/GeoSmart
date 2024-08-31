// Import the necessary modules
import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';

// Create an Express application
const app = express();
// Configured CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://geosmart-app.netlify.app/'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // If you need to send cookies with the requests
}));


// Set the port number for the server
const port = 3000;

// Create an HTTP server and attach it to the Express app
const server = http.createServer(app);

// Initialize a new instance of Socket.IO and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://geosmart-app.netlify.app/'],
  },
});
interface Player {
  name: string;
  isReady: boolean;
}

interface Rooms {
  [roomID: string]: Player[];
}

const rooms: Rooms = {};


interface CustomSocket extends Socket {
  playerName?: string; // You can define a more specific type if needed
}

// Handle Socket.IO connections
io.on('connection', (socket: CustomSocket) => {
  console.log('A user connected:', socket.id);
  // ...handle other events and logic here

  //Host creates a game room
  socket.on('create-game', (roomID) => {
    socket.join(roomID); // to create the room host has to automatically join it.
    socket.emit('gameCreated', { success: true, roomID }); // Send the room ID back to User1
  });

  // When user joins the game
  socket.on('join-game', (roomID, playerName) => {
    const room = io.sockets.adapter.rooms.get(roomID);
    // Check if the room exists and is not empty
    if (room && room.size > 0) {
      console.log(`${playerName} joined roomID ${roomID}`);
      socket.join(roomID); // User joins the room
      // add the user data to sockets instance
      socket.playerName = playerName;

      // Add player to the room's player list
      if (!rooms[roomID]) {
        rooms[roomID] = [];
      }
      rooms[roomID].push({ name: playerName, isReady: false });


      socket.emit('joinedGame', { success: true });
    
      socket.on('sendPlayerToLobby', (playerName) => {
        // Send the current list of players to the newly joined user
        socket.emit('currentPlayers', rooms[roomID]);
        io.to(roomID).emit('player-joined', playerName);
      });

      socket.on('getCurrentList', () => {
        socket.emit('currentPlayers', rooms[roomID]);
      })

      socket.on('player-ready', (roomID, playerName) => {
        const players = rooms[roomID];
        if (players) {
          const player = players.find((p) => p.name === playerName);
          if (player) {
            player.isReady = true;

            // Notify all players in the room about the readiness status
            io.to(roomID).emit('player-readiness-updated', rooms[roomID]);

            // Check if all players are ready
            const allReady = players.every((p) => p.isReady);
            console.log(allReady)
            if (allReady) {
              io.to(roomID).emit('startGame', { state: true });
            }
          }
        }
      });

    } else {
      socket.emit('joinedGame', { success: false, message: 'Room not found' });
    }
  });
  // Optionally handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Define a route for the root path ('/')
app.get('/', (req, res) => {
  // Send a response to the client
  res.send('Hello, TypeScript + Node.js + Express!');
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
function cors(arg0: {
  origin: string[]; methods: string; credentials: boolean; // If you need to send cookies with the requests
}): any {
  throw new Error('Function not implemented.');
}


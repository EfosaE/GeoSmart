import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { getCountries, getRandomCountry, getRandomOptions } from './country';

const app = express();
// Configured CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://geosmart-app.netlify.app/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies with the requests
  })
);

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
  score: number;
}

interface Room {
  answered: boolean;
  correctAnswer: string;
  numberOfPlayers: number;
  players: Player[];
}

interface Rooms {
  [roomID: string]: Room;
}

const rooms: Rooms = {};

// so I can really understand what this looks like lol
// {
//   room123: {
//     numberOfPlayers: 2,
//     players: [
//       { name: "Player1", isReady: true },
//       { name: "Player2", isReady: false },
//     ],
//   },

interface CustomSocket extends Socket {
  playerName?: string; // You can define a more specific type if needed
}

// Handle Socket.IO connections
io.on('connection', (socket: CustomSocket) => {
  console.log('A user connected:', socket.id);
  // ...handle other events and logic here

  //Host creates a game room
  socket.on('create-game', (roomID: string, numberOfPlayers: number) => {
    socket.join(roomID); // to create the room host has to automatically join it.

    // Initialize the room with the number of players
    rooms[roomID] = {
      numberOfPlayers,
      answered: false,
      correctAnswer: '',
      players: [],
    };
    console.log(rooms[roomID]);

    socket.emit('gameCreated', { success: true, room: rooms[roomID] }); // Send the room back to User1 or host
  });

  // When user joins the game
  socket.on('join-game', (roomID, playerName) => {
    const room = io.sockets.adapter.rooms.get(roomID);
    console.log(room);
    // Check if the room exists and is not empty
    if (!room) {
      socket.emit('joinedGame', { success: false, message: 'Room not found' });
      return;
    }
    if (room && rooms[roomID].players.length < rooms[roomID].numberOfPlayers) {
      console.log(`${playerName} joined roomID ${roomID}`);
      socket.join(roomID); // User2 joins the room

      // add the user data to sockets instance
      socket.playerName = playerName;

      // no rooms exist so iniailize with empty values
      if (!rooms[roomID]) {
        rooms[roomID] = {
          numberOfPlayers: 0,
          answered: false,
          correctAnswer: '',
          players: [],
        };
      }
      // Add player to the room's player list
      rooms[roomID].players.push({
        name: playerName,
        isReady: false,
        score: 0,
      });

      socket.emit('joinedGame', { success: true });

      socket.on('sendPlayerToLobby', (playerName) => {
        // Send the current list of players to the newly joined user
        socket.on('lobbyMounted', () => {
          socket.emit('currentRoomInfo', rooms[roomID]);
        });

        io.to(roomID).emit('player-joined', playerName, rooms[roomID].players);
      });

      socket.on('getCurrentList', () => {
        socket.emit('currentPlayers', rooms[roomID]);
      });

      socket.on('player-ready', (roomID, playerName) => {
        const room = rooms[roomID];
        if (room) {
          const player = room.players.find((p) => p.name === playerName);
          if (player) {
            player.isReady = true;

            // Notify all players in the room about the readiness status
            io.to(roomID).emit('player-readiness-updated', rooms[roomID]);

            // Check if all players are ready
            const allReady = room.players.every((p) => p.isReady);
            console.log(allReady);
            if (allReady) {
              io.to(roomID).emit('all-ready');
              socket.on('gameMounted', async () => {
                const countries = await getCountries();
                const country = await getRandomCountry(countries);
                const options = getRandomOptions(countries, country, 4);
                if (country) {
                  io.to(roomID).emit('gameInitialized', {
                    country,
                    options,
                  });

                  socket.on('submit-answer', () => {});
                } else {
                  io.to(roomID).emit('startGame', {
                    state: false,
                    error: 'an error occured',
                  });
                }
              });
            }
          }
        }
      });
    } else {
      socket.emit('joinedGame', { success: false, message: 'Room is Full' });
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
  res.send('Hello from Efosa GeoSmart');
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

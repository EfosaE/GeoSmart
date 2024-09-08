import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { createRoom, endGame, joinRoom } from './controllers/gameController';
import { playerHandler } from './controllers/playerController';
import { answerHandler } from './controllers/questAnsController';

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
const port = process.env.PORT || 3000;

// Create an HTTP server and attach it to the Express app
const server = http.createServer(app);

// Initialize a new instance of Socket.IO and attach it to the HTTP server
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://geosmart-app.netlify.app/'],
  },
});

export interface Player {
  name: string;
  isReady: boolean;
  score: number;
}

export interface Room {
  answers?: { [playerName: string]: string }; // Player Names as keys, answers as values
  correctAnswer: string;
  numberOfPlayers: number;
  players: Player[];
  gameEnded: boolean;
  answered: boolean;
  remainingTime?: number;
  questionTimer?: NodeJS.Timeout; // Type for the timer
}

interface Rooms {
  [roomID: string]: Room;
}

export const rooms: Rooms = {};

export interface CustomSocket extends Socket {
  playerName?: string; // You can define a more specific type if needed
  roomID?: string;
}

// Handle Socket.IO connections
io.on('connection', (socket: CustomSocket) => {
  // Host creates a game room
  socket.on(
    'create-game',
    (roomID: string, numberOfPlayers: number, playerName: string) => {
      createRoom(socket, roomID, numberOfPlayers, playerName);
    }
  );

  // When user joins the game
  socket.on('join-game', (roomID, playerName) => {
    const room: Set<string> | undefined = io.sockets.adapter.rooms.get(roomID);
    // Check if the room exists and is not empty
    if (!room) {
      socket.emit('joinedGame', { success: false, message: 'Room not found' });
      return;
    }

    if (room) {
      joinRoom(socket, room, roomID, playerName);
    }
  });

  // listen for send player to lobby event
  socket.on('sendPlayerToLobby', (playerName, roomID) => {
    // Send the current list of players to the newly joined user
    socket.on('lobbyMounted', () => {
      socket.emit('currentRoomInfo', rooms[roomID]);
    });

    io.to(roomID).emit('player-joined', playerName, rooms[roomID].players);
  });

  socket.on('player-ready', (roomID, playerName) => {
    const room = rooms[roomID];
    if (room) {
      playerHandler(socket, room, playerName, roomID);
    }
  });

  // remember to emit roomID
  socket.on('submit-answer', async (data, roomID: string) => {
    const { playerName, answer, timestamp } = data;
    const correctAnswer = rooms[roomID].correctAnswer;
    const player = rooms[roomID].players.find((p) => p.name === playerName);

    if (!rooms[roomID].answers) {
      rooms[roomID].answers = {};
    }
    rooms[roomID].answers[playerName] = answer;
    // refactor this into a check answer function
    const answersLength = Object.keys(rooms[roomID].answers).length;
    if (player)
      answerHandler(
        socket,
        correctAnswer,
        answer,
        player,
        roomID,
        answersLength
      );
  });

  socket.on('gameOver', (roomID: string) => {
    rooms[roomID].remainingTime = undefined;
    endGame(roomID);
  });

  socket.on('disconnect', () => {
    if (socket.roomID)
      io.to(socket.roomID).emit('playerLeft', socket.playerName);
  });
});

// Define a route for the root path ('/')
app.get('/', (req, res) => {
  // Send a response to the client
  res.send('Hello from Efosa GeoSmart');
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

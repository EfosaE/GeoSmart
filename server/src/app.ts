import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { createGame, joinGame } from './controllers/gameController';
import { playerHandler } from './controllers/playerController';
import { getQuestion } from './controllers/questAnsController';

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
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://geosmart-app.netlify.app/'],
  },
});

interface Player {
  name: string;
  isReady: boolean;
  score: number;
}

export interface Room {
  answers?: { [playerName: string]: string }; // Player Names as keys, answers as values
  answerTimeout?: NodeJS.Timeout | null;
  correctAnswer: string;
  numberOfPlayers: number;
  players: Player[];
}

interface Rooms {
  [roomID: string]: Room;
}

export const rooms: Rooms = {};

// so I can really understand what this looks like lol
// {
//   "room1": {
//     answers: {
//       "Alice": "Canada",
//       "Bob": "France"
//     },
//     answerTimeout: null, // or some timeout value like setTimeout(...),
//     correctAnswer: "Canada",
//     numberOfPlayers: 2,
//     players: [
//       {
//         name: "Alice",
//         isReady: true,
//         score: 10
//       },
//       {
//         name: "Bob",
//         isReady: true,
//         score: 0
//       }
//     ]
//   }
// };

export interface CustomSocket extends Socket {
  playerName?: string; // You can define a more specific type if needed
}

// Handle Socket.IO connections
io.on('connection', (socket: CustomSocket) => {
  console.log('A user connected:', socket.id);

  // Host creates a game room
  socket.on('create-game', (roomID: string, numberOfPlayers: number) => {
    createGame(socket, roomID, numberOfPlayers);
  });

  // When user joins the game
  socket.on('join-game', (roomID, playerName) => {
    const room: Set<string> | undefined = io.sockets.adapter.rooms.get(roomID);
    // Check if the room exists and is not empty
    if (!room) {
      socket.emit('joinedGame', { success: false, message: 'Room not found' });
      return;
    }
    if (room) {
      joinGame(socket, room, roomID, playerName);
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
    console.log(data);
    const { playerName, answer, timestamp } = data;
    const correctAnswer = rooms[roomID].correctAnswer;
    const player = rooms[roomID].players.find((p) => p.name === playerName);

    console.log(`player:${answer}, correct ans:${correctAnswer}`);
    console.log(player);

    if (!rooms[roomID].answers) {
      rooms[roomID].answers = {};
    }
    rooms[roomID].answers[playerName] = answer;
    console.log(rooms[roomID].answers);
    // refactor this into a check answer function
    if (correctAnswer === answer && player) {
      // Increment the player's score for the correct answer
      player.score += 10;
      console.log(rooms[roomID].players)
      console.log('answer is correct')
      socket.emit('answerCorrect');
      io.to(roomID).emit('scoreUpdated', rooms[roomID]);
    } else {
      console.log(rooms[roomID].players);
      console.log('answer is incorrect');
      socket.emit('answerIncorrect');
    }


    if (
      Object.keys(rooms[roomID].answers).length ===
      rooms[roomID].numberOfPlayers
    ) {
      console.log('ANSWERED!!!');
      const data = await getQuestion();
      const { country, options } = data;
      io.to(roomID).emit('next-question', { country, options });
    }

    // if (!rooms[roomID].answered) {
    //   rooms[roomID].answered = true;

    //   // Update the score if correct
    //   if (answer === correctAnswer) {
    //     // Update the player's score

    //     // Update the player's score
    //     if (player)
    //       io.to(roomID).emit('updateScore', {
    //         playerName,
    //         score: player.score + 1,
    //       });
    //   } else {
    //     io.to(roomID).emit('updateScore', 'no player got the question');
    //   }
    // }
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

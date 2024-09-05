import { Socket } from 'socket.io';
import { CustomSocket, io, rooms } from '../app';
import { getNextQuestion } from './questAnsController';

export function startCounter(roomID: string) {
  const defaultDuration = 15; // Set the default counter duration in seconds
  rooms[roomID].remainingTime = defaultDuration;

  // Clear any existing timer before starting a new one
  if (rooms[roomID].questionTimer) {
    clearTimeout(rooms[roomID].questionTimer);
  }

  const updateTimer = () => {
    if (rooms[roomID].remainingTime! <= 0) {
      // Use the value directly
      clearTimeout(rooms[roomID].questionTimer);
      rooms[roomID].answered = true;
      // this is crucial
      rooms[roomID].remainingTime = 0;
      io.to(roomID).emit('timerElapsed', roomID);
      console.log('counter-cleared', rooms[roomID].answered);
      getNextQuestion(roomID);
      return;
    }

    rooms[roomID].remainingTime!--; // Decrement the value directly
    console.log(
      'remaining time in the counter...',
      rooms[roomID].remainingTime
    );
    io.to(roomID).emit('timerUpdated', rooms[roomID].remainingTime);

    rooms[roomID].questionTimer = setTimeout(updateTimer, 1000);
  };

  // Start the countdown
  updateTimer();
}

export const createRoom = (
  socket: CustomSocket,
  roomID: string,
  numberOfPlayers: number,
  playerName: string
) => {
  socket.join(roomID); // to create the room host has to automatically join it.

  // Initialize the room with the number of players
  rooms[roomID] = {
    numberOfPlayers,
    correctAnswer: '',
    gameEnded: false,
    answered: false,
    players: [],
  };
  console.log(rooms[roomID]);
  socket.roomID = roomID;
  socket.emit('gameCreated', { success: true, playerName }); // Send the room back to User1 or host
};

export const joinRoom = (
  socket: CustomSocket,
  room: Set<string>,
  roomID: string,
  playerName: string
) => {
  console.log(room);

  if (room && rooms[roomID].players.length < rooms[roomID].numberOfPlayers) {
    console.log(`${playerName} joined roomID ${roomID}`);
    socket.join(roomID); // User joins the room

    // Add the user and room data to the socket instance
    socket.roomID = roomID;
    socket.playerName = playerName;

    // No rooms exist so initialize with empty values
    if (!rooms[roomID]) {
      rooms[roomID] = {
        numberOfPlayers: 0,
        gameEnded: false,
        correctAnswer: '',
        answered: false,
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
  } else {
    socket.emit('joinedGame', { success: false, message: 'Room is Full' });
  }
};

// Function to end the game
export function endGame(roomID: string) {
  if (rooms[roomID]) {
    // Mark the game as ended
    rooms[roomID].gameEnded = true;

    // Clear any ongoing timer
    clearTimeout(rooms[roomID].questionTimer);
    console.log('Game ended, counter cleared.');

    // Emit the game over event to all players in the room
    io.to(roomID).emit('gameOver', rooms[roomID]);

    // You may also want to perform other cleanup tasks here
    // like resetting player scores, removing the room, etc.
  }
}

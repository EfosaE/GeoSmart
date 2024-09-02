import { Socket } from 'socket.io';
import { CustomSocket, io, rooms } from '../app';

export const createGame = (
  socket: Socket,
  roomID: string,
  numberOfPlayers: number
) => {
  socket.join(roomID); // to create the room host has to automatically join it.

  // Initialize the room with the number of players
  rooms[roomID] = {
    numberOfPlayers,
    correctAnswer: '',
    players: [],
  };
  console.log(rooms[roomID]);

  socket.emit('gameCreated', { success: true, room: rooms[roomID] }); // Send the room back to User1 or host
};


export const joinGame = (
  socket: CustomSocket,
  room: Set<string>,
  roomID: string,
  playerName: string
) => {
  console.log(room);

  if (room && rooms[roomID].players.length < rooms[roomID].numberOfPlayers) {
    console.log(`${playerName} joined roomID ${roomID}`);
    socket.join(roomID); // User joins the room

    // Add the user data to the socket instance
    socket.playerName = playerName;

    // No rooms exist so initialize with empty values
    if (!rooms[roomID]) {
      rooms[roomID] = {
        numberOfPlayers: 0,
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
  } else {
    socket.emit('joinedGame', { success: false, message: 'Room is Full' });
  }
};

import { Socket } from 'socket.io';
import { io, Room, rooms } from '../app';
import { getCountries, getRandomCountry, getRandomOptions } from '../country';
import { getFirstQuestion, getQuestion } from './questAnsController';

export const playerHandler = (
  socket: Socket,
  room: Room,
  playerName: string,
  roomID: string
) => {
  const player = room.players.find((p) => p.name === playerName);
  if (player) {
    player.isReady = true;

    // Notify all players in the room about the readiness status
    io.to(roomID).emit('player-readiness-updated', rooms[roomID], playerName);

    // Check if all players are ready
    const allReady = room.players.every((p) => p.isReady);
    if (allReady) {
      io.to(roomID).emit('all-ready');
      socket.on('gameMounted', async () => {
        getFirstQuestion(roomID);
      });
    }
  }
};

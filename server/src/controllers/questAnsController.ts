import { Socket } from 'socket.io';
import { io, Player, rooms } from '../app';
import { getCountries, getRandomCountry, getRandomOptions } from '../country';
import { startCounter } from './gameController';

export async function getQuestion(roomID: string) {
  rooms[roomID].answered = false;
  const countries = await getCountries();
  let country;
  if (countries) country = getRandomCountry();
  let options;
  if (country) options = getRandomOptions(country, 4);
  return { country, options };
}

export async function getFirstQuestion(roomID: string) {
  // Get new question
  const data = await getQuestion(roomID);
  const { country, options } = data;
  if (country) {
    io.to(roomID).emit('gameInitialized', {
      country,
      options,
    });
    // store the correct answer in the room object
    rooms[roomID].correctAnswer = country.name.common;
    console.log('correct answer', rooms[roomID].correctAnswer);
  } else {
    io.to(roomID).emit('startGame', {
      state: false,
      error: 'an error occurred',
    });
  }
  startCounter(roomID);
}

export async function getNextQuestion(roomID: string) {
  // Check if the game is still ongoing
  if (!rooms[roomID] || rooms[roomID].gameEnded) {
    clearTimeout(rooms[roomID].questionTimer);
    return;
  }
  // clearing the answers off the room object
  rooms[roomID].answers = {};
  rooms[roomID].answered = false;

  // Get new question
  const data = await getQuestion(roomID);
  const { country, options } = data;

  // store the correct answer in the room object
  if (country) rooms[roomID].correctAnswer = country.name.common;
  io.to(roomID).emit('next-question', { country, options });
  startCounter(roomID);
}

export async function answerHandler(
  socket: Socket,
  correctAnswer: string,
  answer: string,
  player: Player,
  roomID: string,
  answersLength: number
) {
  if (correctAnswer === answer) {
    // Increment the player's score for the correct answer
    player.score += 10;
    console.log('players', rooms[roomID].players);
    socket.emit('answerCorrect');
    //  it throws if i send room[roomID]
    io.to(roomID).emit('scoreUpdated', rooms[roomID].players);
  } else {
    console.log(rooms[roomID].players);
    socket.emit('answerIncorrect');
  }

  if (
    answersLength === rooms[roomID].numberOfPlayers &&
    rooms[roomID].remainingTime! > 0
  ) {
    rooms[roomID].answered = true;
    clearTimeout(rooms[roomID].questionTimer);
    console.log('ANSWERED BY PLAYERS BEFORE TIMER');
    // this is supposed to print true
    console.log(rooms[roomID].answered);
    getNextQuestion(roomID);
  }
  console.log('remaining time from answerHandler', rooms[roomID].remainingTime!);
  if (rooms[roomID].remainingTime! <= 0) {
    rooms[roomID].answered = true;
    clearTimeout(rooms[roomID].questionTimer);
    console.log('ANSWERED BY TIMER');
    getNextQuestion(roomID);
  }
}

// export function answeredByTimer(roomID: string) {
//   rooms[roomID].answered = true;
//   console.log('ANSWERED BY TIMER');
//   console.log('answers after timer', rooms[roomID].answers);
//   // Get new question
//   // getNextQuestion(roomID);
// }

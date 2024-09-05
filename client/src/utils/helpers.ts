
import { GameState } from '../types';
import { Country } from '../types/appTypes';

export const toastOptions = {
  autoClose: 500, // Closes after .5 second (500 milliseconds)
  hideProgressBar: true, // Optionally hide the progress bar
  pauseOnHover: false, // Optionally prevent pausing on hover
  closeOnClick: true, // Close the toast when clicked
  draggable: true, // Allow the toast to be draggable
};

export function getRandomOptions(
  countries: Country[],
  correctCountry: Country,
  numberOfOptions: number
): Country[] {
  const options = [correctCountry];
  const countriesCopy = [...countries];

  // Remove the correct country from the list to avoid duplicates
  const correctCountryIndex = countriesCopy.findIndex(
    (country) => country.name.common === correctCountry.name.common
  );
  countriesCopy.splice(correctCountryIndex, 1);

  // Add random incorrect options
  while (options.length < numberOfOptions) {
    const randomIndex = Math.floor(Math.random() * countriesCopy.length);
    const randomCountry = countriesCopy.splice(randomIndex, 1)[0];
    options.push(randomCountry);
  }

  // Shuffle the options array
  return options.sort(() => Math.random() - 0.5);
}

export function getRandomCountry(countries: Country[]) {
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

export const INITIAL_STATE: GameState = {
  gameInfo: {
    // this score is to handle the single player
    score: 0,
    totalQuestions: 5,
    roomID: '',
    totalRounds: 1,
    currentRound: 1,
    isGameStarted: false,
    isGameOver: false,
    currentQuestion: 1,
    atLobby: false,
    atGame: true,
    noOfPlayers: 1,
    // this one handles multi-player if you check the type
    players: [],
  },

  isHost: false,
  playerName: '',
  gameMode: {
    mode: 'single', // single, multi
    gameType: '', // flags, capital
  },
  isLoading: false,
  socket: null,
  error: null,
};

export function getRandomString() {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const maxLength = 7;
  let randomString = '';

  for (let i = 0; i < maxLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

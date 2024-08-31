import { Socket } from 'socket.io-client';

interface SetScoreAction {
  type: 'SET_SCORE';
}
interface SetGameStartAction {
  type: 'SET_GAME_START';
  payload: boolean;
}
interface SetHostAction {
  type: 'SET_HOST';
  payload: boolean;
}
interface SetPlayerAction {
  type: 'SET_PLAYER_NAME';
  payload: string;
}
interface SetGameOverAction {
  type: 'SET_GAME_OVER';
  payload: boolean;
}

interface SetGameTypeAction {
  type: 'SET_GAME_TYPE';
  payload: string; // or any type that represents the game type
}

interface IncrementQuestionAction {
  type: 'INCREMENT_QUESTION';
}
interface SetRoomIdAction {
  type: 'SET_ROOM_ID';
  payload: string
}
interface IncrementRoundAction {
  type: 'INCREMENT_ROUND';
}
interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}
interface ResetGameAction {
  type: 'RESET_GAME';
}
interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}
interface SetLobbyAction {
  type: 'PROCEED_TO_LOBBY';
  payload: boolean;
}
interface SetSocketAction {
  type: 'SET_SOCKET';
  payload: Socket | null;
}
interface SetPlayersAction {
  type: 'SET_PLAYERS';
  payload: string[];
}
interface SetNoPlayersAction {
  type: 'SET_NO_PLAYERS';
  payload: number;
}
export type ActionType =
  | SetScoreAction
  | SetPlayersAction
  | SetNoPlayersAction
  | SetLoadingAction
  | SetLobbyAction
  | SetErrorAction
  | SetHostAction
  | SetPlayerAction
  | SetSocketAction
  | SetGameStartAction
  | ResetGameAction
  | SetGameOverAction
  | SetGameTypeAction
  | SetRoomIdAction
  | IncrementQuestionAction
  | IncrementRoundAction;

// Define other action interfaces as needed

export interface GameState {
  gameInfo: {
    score: number;
    roomID: string;
    totalQuestions: number;
    totalRounds: number;
    isGameOver: boolean;
    currentQuestion: number;
    currentRound: number;
    isGameStarted: boolean;
    atLobby: boolean;
    noOfPlayers: number;
    players: string[]
  };
  isHost: boolean;
  playerName: string;
  gameMode: {
    gameType: string;
    mode: string;
  };
  isLoading: boolean;
  socket: Socket | null;
  error: string | null;
}

import { ActionType, GameState } from './types';
import { INITIAL_STATE } from './utils/helpers';

export const AppReducer = (state: GameState, action: ActionType):GameState => {
  switch (action.type) {
    case 'SET_SCORE':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          score: state.gameInfo.score + 1,
        },
      };
    case 'SET_GAME_START':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          isGameStarted: (state.gameInfo.isGameStarted = action.payload),
        },
      };
    case 'SET_GAME_OVER':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          isGameOver: (state.gameInfo.isGameOver = action.payload),
        },
      };
    case 'SET_HOST':
      return {
        ...state,
        isHost: action.payload,
      };
    case 'SET_PLAYER_NAME':
      return {
        ...state,
        playerName: action.payload,
      };
    case 'INCREMENT_QUESTION':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          currentQuestion: state.gameInfo.currentQuestion + 1,
        },
      };

    case 'SET_SOCKET':
      return {
        ...state,
        socket: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_PLAYERS':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          players: action.payload,
        },
      };
    case 'SET_NO_PLAYERS':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          noOfPlayers: action.payload,
        },
      };
    case 'SET_ROOM_ID':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          roomID: action.payload,
        },
      };
    case 'PROCEED_TO_LOBBY':
      return {
        ...state,
        gameInfo: {
          ...state.gameInfo,
          atLobby: action.payload,
        },
      };
    case 'RESET_GAME':
      return INITIAL_STATE;
    default:
      return state;
  }
};

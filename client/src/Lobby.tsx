import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './GlobalContext';
import { toast } from 'react-toastify';
export type Player = {
  name: string;
  isReady: boolean;
  score: number;
};
export interface PlayerScore {
  name: string;
  score: number;
}
interface Room {
  answered: boolean;
  correctAnswer: string;
  numberOfPlayers: number;
  players: Player[];
}
const Lobby = () => {
  const { state, dispatch } = useContext(GlobalContext);

  const [isPollDone, setIsPollDone] = useState<boolean>(false);
  // #1
  useEffect(() => {
    state.socket?.emit('lobbyMounted');
    console.log('RoomID from lobby',state.gameInfo.roomID)
    const handleCurrentRoomInfo = (data: Room) => {
      console.log('Room', data);
      const playerData = data.players.map((player: Player) => ({
        name: player.name,
        score: player.score,
      }));
      // Replace the players array with the current list of players for newer joins
      dispatch({ type: 'SET_NO_PLAYERS', payload: data.numberOfPlayers });
      dispatch({ type: 'SET_PLAYERS', payload: playerData });
      console.log(data.numberOfPlayers); // Updated log for the current number of players
      setIsPollDone(true);
    };

    const handleAllReady = () => {
      dispatch({ type: 'SET_GAME_START', payload: true });
    };

    // Add the listener for the 'all-ready' event
    state.socket?.on('all-ready', handleAllReady);

    // Listen for the `currentRoomInfo` event when the component mounts
    state.socket?.on('currentRoomInfo', handleCurrentRoomInfo);

    // Clean up the listener when the component unmounts
    return () => {
      state.socket?.off('all-ready', handleAllReady);
      state.socket?.off('currentRoomInfo', handleCurrentRoomInfo);
    };
  }, [state.socket, dispatch]); // Include only necessary dependencies yunno vscode
  // #2
  useEffect(() => {
    const handlePlayerJoined = (playerName: string, data: Player[]) => {
      if (state.playerName !== playerName) {
        toast.info(` ${playerName} just joined`);
      }

      console.log('data', data);
      // Transformed data to only include name and score
      const filteredPlayers: PlayerScore[] = data.map(({ name, score }) => ({
        name,
        score,
      }));
      dispatch({
        type: 'SET_PLAYERS',
        payload: filteredPlayers,
      });
    };

    state.socket?.on('player-joined', handlePlayerJoined);

    return () => {
      state.socket?.off('player-joined', handlePlayerJoined); // Clean up listener
    };
  }, [dispatch, state.playerName, state.socket]); // Only include necessary dependencies

  // #3
  useEffect(() => {
    const handlePlayerReadinessUpdated = (data: Room, playerName: string) => {
      console.log(data);
      if (state.playerName !== playerName) {
        toast.info(` ${playerName} is ready`);
      }
    };

    state.socket?.on('player-readiness-updated', handlePlayerReadinessUpdated);

    return () => {
      state.socket?.off(
        'player-readiness-updated',
        handlePlayerReadinessUpdated
      ); // Clean up listener
    };
  }, [state.playerName, state.socket]);

  function emitPlayerReady() {
    state.socket?.emit('player-ready', state.gameInfo.roomID, state.playerName);
    dispatch({ type: 'SET_LOADING', payload: true });
  }

  return (
    <div className='container '>
      {state.gameInfo.isGameOver ? (
        <div className='flex flex-col items-center justify-center'>
          <p className='text-green-600'>Opponent Disconnected, YOU WIN!!! </p>
          <button
            className='rounded-md py-2 px-3 bg-indigo-600 text-white my-2'
            onClick={() => {
              dispatch({ type: 'RESET_GAME' });
              dispatch({ type: 'SET_GAME_START', payload: false });
            }}>
            End Game Session
          </button>
        </div>
      ) : (
        <>
          <div>
            <p>
              Expecting{' '}
              <span className='text-violet-700'>
                {state.gameInfo.noOfPlayers}
              </span>{' '}
              players
            </p>
          </div>
          <div>
            {state.gameInfo.players.map((player) => {
              return (
                <p className='' key={player.name}>
                  {player.name}
                </p>
              );
            })}
          </div>
          <p className='my-4'>
            {!isPollDone && !state.isHost && 'Getting Opponents...'}
          </p>
          <p className='my-4'>
            {state.gameInfo.players.length <= 1 &&
              state.isHost &&
              'Waiting for Room Joins...'}
          </p>
          <div className='flex gap-2'>
            {state.gameInfo.noOfPlayers && (
              <button
                className='bg-indigo-700 py-2 px-4 rounded-md text-white cursor-pointer disabled:opacity-50'
                onClick={emitPlayerReady}
                disabled={
                  state.isLoading || state.gameInfo.players.length <= 1
                }>
                {state.isLoading ? 'Waiting for Oppo...' : 'Start Game'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Lobby;

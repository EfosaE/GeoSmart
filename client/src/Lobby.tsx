import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './GlobalContext';
import { toast } from 'react-toastify';
type Player = {
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

  useEffect(() => {
    state.socket?.emit('lobbyMounted');
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

    // Listen for the `currentRoomInfo` event when the component mounts
    state.socket?.on('currentRoomInfo', handleCurrentRoomInfo);

    // Clean up the listener when the component unmounts
    return () => {
      state.socket?.off('currentRoomInfo', handleCurrentRoomInfo);
    };
  }, [state.socket, dispatch]); // Include only necessary dependencies yunno vscode

  // Keeping this here to show that i used an unnecessary complexity to get latest room info
  // useEffect(() => {
  //   function pollForPlayerListUpdate() {
  //     // Start polling
  //     const intervalId = setInterval(() => {
  //       state.socket?.emit('getCurrentList');
  //     }, 1000); // Poll every second

  //     const handleCurrentPlayers = (data: { players: Player[] }) => {
  //       console.log(data);
  //       const playerData = data.players.map((player: Player) => ({
  //         name: player.name,
  //         score: player.score,
  //       }));

  //       dispatch({ type: 'SET_PLAYERS', payload: playerData });

  //       // Stop polling and cleanup
  //       clearInterval(intervalId);
  //       console.log('Polling stopped');
  //       setIsPollDone(true);
  //     };

  //     // Add event listener
  //     state.socket?.on('currentPlayers', handleCurrentPlayers);

  //     // Return cleanup function
  //     return () => {
  //       clearInterval(intervalId);
  //       state.socket?.off('currentPlayers', handleCurrentPlayers); // Remove event listener
  //     };
  //   }

  //   // Only start polling if not host
  //   if (!state.isHost) {
  //     const cleanup = pollForPlayerListUpdate();

  //     // Cleanup function to stop polling and remove listeners
  //     return cleanup;
  //   }

  //   // No cleanup needed if isHost is true
  //   return undefined;
  // }, [dispatch, state.isHost, state.socket]);

  function emitPlayerReady() {
    state.socket?.emit('player-ready', state.gameInfo.roomID, state.playerName);
    console.log('checking recipient', state.gameInfo.roomID, state.playerName);
    dispatch({ type: 'SET_LOADING', payload: true });

    // state.socket?.on('startGame', (data) => {
    //   console.log('Game Started');
    //   setIsLoading(false);
    //   if (data.state) dispatch({ type: 'SET_GAME_START', payload: true });
    // });
  }
  

  console.log('at game?', state.gameInfo.isGameStarted);
  useEffect(() => {
    // Listen for the 'player-joined' event from the server
    state.socket?.on('player-joined', (playerName: string, data: Player[]) => {
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
    });

    console.log('list on app', state.gameInfo.players);

    // Listen for the 'player-readiness' event from the server
    state.socket?.on('player-readiness-updated', (data) => {
      console.log('A player is ready', data);
    });
  }, [
    dispatch,
    state.gameInfo.players,
    state.playerName,
    state.socket,
  ]);
useEffect(() => {
  const handleAllReady = () => {
    dispatch({ type: 'SET_GAME_START', payload: true });
  };

  // Add the listener for the 'all-ready' event
  state.socket?.on('all-ready', handleAllReady);

  // Clean up the listener when the component unmounts
  return () => {
    state.socket?.off('all-ready', handleAllReady);
  };
}, [dispatch, state.socket]);




  return (
    <div className='container '>
      <div>
        <p>
          Expecting{' '}
          <span className='text-violet-700'>{state.gameInfo.noOfPlayers}</span>{' '}
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
            disabled={state.isLoading || state.gameInfo.players.length <= 1}>
            {state.isLoading ? 'Waiting for Oppo...' : 'Start Game'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Lobby;

import { useContext, useEffect } from 'react';
import { GlobalContext } from './GlobalContext';
type Player = {
  name: string,
  isReady: boolean
}
const Lobby = () => {
  const { state, dispatch } = useContext(GlobalContext);
  function getCurrentList() {
    state.socket?.emit('getCurrentList');
    state.socket?.on('currentPlayers', (data) => {
      console.log('List of players', data);
      const playerNames = data.map((player:Player) => player.name);
      dispatch({ type: 'SET_PLAYERS', payload: playerNames });
    });
  }

  function emitPlayerReady() {
    
    state.socket?.emit('player-ready', state.gameInfo.roomID, state.playerName);
    console.log('checking recipient', state.gameInfo.roomID, state.playerName);
    dispatch({ type: 'SET_LOADING', payload: true })
    
    state.socket?.on('startGame', (data) => {
      console.log('Game Started')
      if(data.state)
          dispatch({ type: 'SET_GAME_START', payload: true });
    })
  }

  useEffect(() => {
    // Listen for the 'player-joined' event from the server
    state.socket?.on('player-joined', (playerName) => {
      console.log('A new player joined:', playerName);
      dispatch({
        type: 'SET_PLAYERS',
        payload: [...state.gameInfo.players, playerName],
      });
    });

    console.log('list on app', state.gameInfo.players);

    // Listen for the 'player-readiness' event from the server
    state.socket?.on('player-readiness-updated', (data) => {
      console.log('A player is ready', data);
    });
    // state.socket?.on('currentPlayers', (data:string[]) => {
    //   console.log('List of players', data);
    //   // replaces the players array with the current list of players for newer joins
    //   dispatch({ type: 'SET_PLAYERS', payload: data });
    // });
  }, [dispatch, state.gameInfo.players, state.socket]);

  return (
    <div className='container '>
      <div>
        {state.gameInfo.players.map((player) => {
          return (
            <p className='' key={player}>
              {player}
            </p>
          );
        })}
      </div>

      <div className='flex gap-2'>
        <button
          onClick={getCurrentList}
          className='bg-indigo-300 py-2 px-4 rounded-md text-white cursor-pointer disabled:opacity-50'>
          Update List
        </button>
        {state.gameInfo.noOfPlayers && (
          <button
            className='bg-indigo-700 py-2 px-4 rounded-md text-white cursor-pointer disabled:opacity-50'
            onClick={emitPlayerReady} disabled={state.isLoading}
            >
          {state.isLoading ? 'Waiting for Oppo...': 'Start Game'}  
          </button>
        )}
      </div>
    </div>
  );
};

export default Lobby;

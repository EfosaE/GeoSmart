import { useContext, useEffect } from 'react';
import { GlobalContext } from '../GlobalContext';
import lossSound from '../assets/loss.mp3';
import shimmerSound from '../assets/shimmer.mp3';
import { PlayerScore } from '../types/appTypes';

const loss = new Howl({
  src: [lossSound],
});

const win = new Howl({
  src: [shimmerSound],
});

const GameEnd = () => {
  const { state, dispatch } = useContext(GlobalContext);

  const determineGameOutcome = (players: PlayerScore[]) => {
    if (players.length !== 2) {
      throw new Error('There must be exactly two players');
    }

    // Extract player objects
    const [player1, player2] = players;

    // Compare scores
    if (player1.score > player2.score) {
      return { winner: player1, loser: player2, draw: false };
    } else if (player2.score > player1.score) {
      return { winner: player2, loser: player1, draw: false };
    } else {
      return { winner: null, loser: null, draw: true };
    }
  };

  // Example usage
  const outcome = determineGameOutcome(state.gameInfo.players);

  useEffect(() => {
    console.log(outcome.winner, state.playerName);
    if (outcome.winner?.name === state.playerName) {
      win.play();
    } else {
      loss.play();
    }

    return () => {
      loss.stop();
      win.stop();
    };
  }, [outcome.winner, state.playerName]);

  if (outcome.draw) {
    return (
      <div className='container flex flex-col items-center justify-center '>
        <h2 className='text-2xl font-bold text-red-700'>Game Over</h2>
        <h3 className='text-indigo-500  font-bold'>DRAW !!!</h3>
        <div>
          <div className='flex flex-col'>
            {state.gameInfo.players.map((player) => {
              return (
                <p key={player.name}>
                  <span className='text-blue-400'>{player.name}</span> scored{' '}
                  <span className='text-blue-400'>{player.score}</span> points
                </p>
              );
            })}
          </div>
        </div>
        <button
          className='rounded-md py-2 px-3 bg-indigo-600 text-white my-2'
          onClick={() => {
            dispatch({ type: 'RESET_GAME' });
            dispatch({ type: 'SET_GAME_START', payload: false });
          }}>
          End Game Session
        </button>
      </div>
    );
  }

  return (
    <div className='container flex flex-col items-center justify-center'>
      <h2 className='text-2xl font-bold text-red-700'>Game Over</h2>
      <div className='mt-2 text-lg text-indigo-600 items-center justify-center flex flex-col gap-2'>
        <h3>Final scores:</h3>
        <div className='flex flex-col items-center justify-center'>
          {state.gameInfo.players.map((player) => {
            return (
              <p key={player.name}>
                <span className='text-blue-400'>{player.name}</span> scored{' '}
                <span className='text-blue-400'>{player.score}</span> points
              </p>
            );
          })}
        </div>
        {outcome.winner?.name === state.playerName ? (
          <div className='text-green-500 font-bold'>YOU WIN!!!</div>
        ) : (
          <div className='text-red-500 font-bold'>YOU LOSE !!!</div>
        )}
      </div>

      <button
        className='rounded-md py-2 px-3 bg-indigo-600 text-white my-2'
        onClick={() => {
          dispatch({ type: 'RESET_GAME' });
          dispatch({ type: 'SET_GAME_START', payload: false });
        }}>
        End Game Session
      </button>
    </div>
  );
};

export default GameEnd;

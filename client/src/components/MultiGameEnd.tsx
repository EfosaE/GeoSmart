import { useContext } from 'react';
import { GlobalContext } from '../GlobalContext';

const GameEnd = () => {
  const { state, dispatch } = useContext(GlobalContext);
  // Find the player with the highest score
  const winner = state.gameInfo.players.reduce(
    (max, player) => (player.score > max.score ? player : max),
    state.gameInfo.players[0]
  );

  console.log(`${winner.name} won with a score of ${winner.score}`);
  return (
    <div className='container flex flex-col items-center justify-center'>
      <h2 className='text-2xl font-bold text-red-700'>Game Over</h2>
      <div className='mt-2 text-lg text-indigo-600 flex flex-col gap-2'>
        <h3>Final scores:</h3>
        <div className='flex flex-col'>
          {state.gameInfo.players.map((player) => {
            return (
              <p key={player.name}>
                {player.name} scored {player.score} points
              </p>
            );
          })}
        </div>
        {winner && (
          <p
            className={`${
              winner.name !== state.playerName
                ? 'text-red-400'
                : 'text-green-400'
            }`}>
            {winner.name} won with a score of {winner.score}
          </p>
        )}
      </div>
      <button
        className='rounded-md py-2 px-3 bg-blue-100 bg-opacity-50 text-indigo-500 '
        onClick={() => {
          dispatch({ type: 'RESET_GAME' });
        }}
        disabled={true}>
        Restart Game
      </button>

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

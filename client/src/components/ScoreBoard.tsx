import { useContext } from 'react';
import { GlobalContext } from '../GlobalContext';

export const SinglePlayerScoreBoard = () => {
  const { state } = useContext(GlobalContext);

  return (
    <div className='max-w-sm mx-auto bg-indigo-100 border-2 border-indigo-400 rounded-lg drop-shadow-lg p-6 mt-6'>
      <h2 className='text-2xl font-bold text-indigo-800 text-center mb-4'>
        Scoreboard
      </h2>
      <div className='bg-indigo-200 p-4 rounded-lg text-center'>
        <p className='text-xl text-indigo-700'>Current Score</p>
        <p className='text-4xl font-extrabold text-indigo-900 mt-2'>
          {state.gameInfo.score}
        </p>
      </div>
    </div>
  );
};


export const MultiPlayerScoreBoard = () => {
  const { state } = useContext(GlobalContext);

  return (
    <div className='max-w-sm mx-auto bg-indigo-100 border-2 border-indigo-400 rounded-lg drop-shadow-lg p-6 mt-6'>
      <h2 className='text-2xl font-bold text-indigo-800 text-center mb-4'>
        Scoreboard
      </h2>
      <div className='bg-indigo-200 p-4 rounded-lg text-center'>
        {state.gameInfo.players.map((player) => {
          return (
            <p key={player.name}>
              {player.name}: {player.score}
            </p>
          );
        })}
      </div>
    </div>
  );
};

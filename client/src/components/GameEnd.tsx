import { useContext } from 'react';
import { GlobalContext } from '../GlobalContext';

const GameEnd = () => {
  const { state, dispatch } = useContext(GlobalContext);
  return (
    <div className='container flex flex-col items-center justify-center'>
      <h2 className='text-2xl font-bold text-red-700'>Game Over</h2>
      <p className='mt-2 text-lg text-red-600'>
        Thanks for playing! Your final score is {state.gameInfo.score} out of {state.gameInfo.totalQuestions}.
      </p>
      <button
        className='rounded-md py-2 px-3 bg-blue-100 bg-opacity-50 text-indigo-500 '
        onClick={() => {
          dispatch({ type: 'RESET_GAME' });
        }}>
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

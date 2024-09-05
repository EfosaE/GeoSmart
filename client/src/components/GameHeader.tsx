import { useContext } from 'react';
import { GlobalContext } from '../GlobalContext';

const GameHeader = () => {
  const { state } = useContext(GlobalContext);
  return (
    <div className='flex flex-col items-center justify-center '>
      {state.gameInfo.currentQuestion <= state.gameInfo.totalQuestions && (
        <p className='font-bold text-xl text-indigo-500'>
          {state.gameInfo.currentQuestion}/{state.gameInfo.totalQuestions}
        </p>
      )}
    </div>
  );
};

export default GameHeader;

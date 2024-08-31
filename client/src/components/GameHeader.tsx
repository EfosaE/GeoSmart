import  { useContext } from 'react'
import {GlobalContext} from '../GlobalContext';

const GameHeader = () => {
      const { state } = useContext(GlobalContext);
  return (
    <div className='flex flex-col items-center justify-center '>
      <p className=' text-indigo-400 opacity-75 '>
        <span className='capitalize'>{state.gameMode.gameType}</span> (Round{' '}
        {state.gameInfo.currentRound} out of {state.gameInfo.totalRounds})
      </p>
      <p className='font-bold text-xl text-indigo-500'>
        {state.gameInfo.currentQuestion}/{state.gameInfo.totalQuestions}
      </p>
    </div>
  );
}

export default GameHeader
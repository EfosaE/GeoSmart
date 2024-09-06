import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import answeredMusic from '../assets/answered.mp3';
import { toast } from 'react-toastify';
import { Howl } from 'howler';
import MultiGameEnd from './MultiGameEnd';
import { Country, Data, PlayerScore } from '../types/appTypes';
import { toastOptions } from '../utils/helpers';

const answeredEffect = new Howl({
  src: [answeredMusic], // Replace with your sound file
});

const MultiPlayerGameInterface = () => {
  const [countryQuestion, setCountryQuestion] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[] | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const [remainingTime, setRemainingTime] = useState<number | undefined>();

  const { state, dispatch } = useContext(GlobalContext);

  // UseEffect to control TimeOut and TimerUpdated
  useEffect(() => {
    const socket = state.socket;
    // Listen for the 'timerUpdated' event
    socket?.on('timerUpdated', (time: number) => {
      setRemainingTime(time);
    });
    // Listen for the 'timeOut' event from the server
    socket?.on('timerElapsed', () => {});

    // Cleanup function to remove the event listener
    return () => {
      socket?.off('timerOut'); // Remove the 'timeOut' event listener
      socket?.off('timerUpdated');
    };
  }, [state.socket, state.gameInfo.currentQuestion]);

  // #1
  useEffect(() => {
    const socket = state.socket;

    // Emit 'gameMounted' event
    socket?.emit('gameMounted');

    // Set loading state to true
    dispatch({ type: 'SET_LOADING', payload: true });

    // Event handler for 'gameInitialized'
    const handleGameInitialized = (data: Data) => {
      setCountryQuestion(data.country);
      setOptions(data.options);
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    // Register the event listener
    socket?.on('gameInitialized', handleGameInitialized);

    // Cleanup function to remove the event listener
    return () => {
      socket?.off('gameInitialized', handleGameInitialized);
    };
  }, [dispatch, state.gameInfo.roomID, state.socket]);

  // #3
  useEffect(() => {
    const socket = state.socket;

    const handleAnswerCorrect = () => {
      toast.success('correct', toastOptions);
    };

    const handleScoreUpdated = (data: PlayerScore[]) => {
      dispatch({ type: 'SET_PLAYERS', payload: data });
    };

    const handleAnswerIncorrect = () => {
      toast.error('incorrect', toastOptions);
    };

    const handleNextQuestion = (data: Data) => {
      setIsDisabled(false);
      dispatch({ type: 'INCREMENT_QUESTION' });
      setCountryQuestion(data.country);
      setOptions(data.options);
    };

    // Register event listeners
    socket?.on('answerCorrect', handleAnswerCorrect);
    socket?.on('scoreUpdated', handleScoreUpdated);
    socket?.on('answerIncorrect', handleAnswerIncorrect);
    socket?.on('next-question', handleNextQuestion);

    // Cleanup function to remove event listeners
    return () => {
      socket?.off('answerCorrect', handleAnswerCorrect);
      socket?.off('scoreUpdated', handleScoreUpdated);
      socket?.off('answerIncorrect', handleAnswerIncorrect);
      socket?.off('next-question', handleNextQuestion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.socket, state.gameInfo.score]);

  function handleSubmitAnswer(answer: string, playerName: string) {
    answeredEffect.play();

    state.socket?.emit(
      'submit-answer',
      {
        answer,
        playerName,
        timestamp: Date.now(),
      },
      state.gameInfo.roomID
    );
    setIsDisabled(true);
  }

  if (state.isLoading) {
    return (
      <p className='container flex items-center justify-center'>
        Loading Game Data...
      </p>
    );
  }

  if (state.gameInfo.isGameOver && state.gameMode.mode === 'multi') {
    return (
      <div className='flex flex-col items-center justify-center'>
        <p className='text-indigo-600'>Opponent Disconnected.</p>
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
    <div className='container'>
      <div>
        {state.gameInfo.currentQuestion > state.gameInfo.totalQuestions ? (
          <MultiGameEnd />
        ) : (
          <div className='container flex flex-col items-center justify-center'>
            <p
              className={`${
                remainingTime! < 5 ? 'text-red-500' : 'text-green-500'
              }`}>
              {remainingTime} seconds
            </p>
            <div>
              <img
                src={countryQuestion?.flags.svg}
                alt={countryQuestion?.flags.alt}
                className='size-40 m-2'
              />
            </div>
            <div className='flex flex-col gap-2'>
              {options?.map((country, index) => (
                <button
                  key={index}
                  className='w-64 py-2 rounded text-[#6D31EDFF] bg-[#F5F1FEFF]'
                  onClick={() => {
                    handleSubmitAnswer(country.name.common, state.playerName);
                  }}
                  disabled={isDisabled}>
                  {country.name.common}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiPlayerGameInterface;

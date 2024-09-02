import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import { Country } from '../Home';
import GameEnd from './GameEnd';
import { toast } from 'react-toastify';
import {  PlayerScore } from '../Lobby';

type Data = {
  country: Country;
  options: Country[];
};

const toastOptions = {
  autoClose: 1000, // Closes after 1 second (1000 milliseconds)
  hideProgressBar: true, // Optionally hide the progress bar
  pauseOnHover: false, // Optionally prevent pausing on hover
  closeOnClick: true, // Close the toast when clicked
  draggable: true, // Allow the toast to be draggable
};
const MultiPlayerGameInterface = () => {
  const [countryQuestion, setCountryQuestion] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[] | null>(null);
  const { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {
    state.socket?.emit('gameMounted');
    dispatch({ type: 'SET_LOADING', payload: true });
    state.socket?.on('gameInitialized', (data: Data) => {
      console.log(data);
      setCountryQuestion(data.country);
      setOptions(data.options);
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, [dispatch, state.socket]);

  useEffect(() => {
    state.socket?.on('answerCorrect', () => {
      console.log('answer correct');
      toast.success('correct', toastOptions);
    });
    state.socket?.on('scoreUpdated', (data) => {
      console.log('score updated', data);
      // Transformed data to only include name and score
      const filteredPlayers: PlayerScore[] = data.players.map(
        ({ name, score }: PlayerScore) => ({
          name,
          score,
        })
      );
      dispatch({ type: 'SET_PLAYERS', payload: filteredPlayers });
    });
    state.socket?.on('answerIncorrect', () => {
      console.log('answer incorrect');
      toast.error('incorrect', toastOptions);
    });
    console.log(state.gameInfo.score);
    state.socket?.on('next-question', (data: Data) => {
      console.log('new question:', data);
    });
  }, [state.socket, dispatch, state.playerName, state.gameInfo.score]);

  function handleSubmitAnswer(answer: string, playerName: string) {
    state.socket?.emit(
      'submit-answer',
      {
        answer,
        playerName,
        timestamp: Date.now(),
      },
      state.gameInfo.roomID
    );
  }

  if (state.isLoading) {
    return <p className='container'>Loading Game Data...</p>;
  }

  return (
    <div className='container'>
      <div>
        {state.gameInfo.isGameOver ? (
          <GameEnd />
        ) : (
          <div className='container flex flex-col items-center justify-center'>
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
                  onClick={() =>
                    handleSubmitAnswer(country.name.common, state.playerName)
                  }>
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

import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import { Country } from '../Home';
import GameEnd from './GameEnd';

type Data = {
  country: Country;
  options: Country[];
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
    state.socket?.on('next-question', () => {});
  }, [state.socket, dispatch]);

  function handleClick(name: string) {
    state.socket?.emit('submit-answer', name);
  }

  if (state.isLoading) {
    return <p>Loading Game Data...</p>;
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
                  onClick={() => handleClick(country.name.common)}>
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

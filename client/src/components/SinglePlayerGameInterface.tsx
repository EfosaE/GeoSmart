import { useContext, useEffect, useState } from 'react';
import { getRandomCountry, getRandomOptions } from '../utils/helpers';
import { GlobalContext } from '../GlobalContext';
import GameEnd from './GameEnd';
import axios from 'axios';
import { Country } from '../types/appTypes';

const SinglePlayerGameInterface = () => {
  const [questionCountry, setQuestionCountry] = useState<Country | null>(null);
  const { state, dispatch } = useContext(GlobalContext);
  const [countries, setCountries] = useState<Country[] | null>(null);
  // const [remainingTime, setRemainingTime] = useState(10);
  // const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
  //   undefined
  // );
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  // const { socket } = useContext(SocketContext);
  // Function to handle the timer
  // const startTimer = () => {
  //   console.log('timer started');
  //   setRemainingTime(10); // Reset timer to 10 seconds

  //   const countdown = (time: number) => {
  //     if (time < 0) {
  //       console.log('timer ended');
  //       // Timer has reached 0, emit time out event
  //       // state.socket?.emit('timeOut', state.gameInfo.roomID);
  //       return;
  //     }
  //     setRemainingTime(time);
  //     timerRef.current = setTimeout(() => countdown(time - 1), 1000); // Set the next timeout
  //   };

  //   countdown(10); // Start the countdown with 10 seconds
  // };
  // useEffect(() => {
  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current); // Cleanup the timer when the component unmounts
  //     }
  //   };
  // }, []);
  async function fetchCountriesData() {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    setCountries(response.data);
  }

  useEffect(() => {
    fetchCountriesData();
  }, []);

  useEffect(() => {
    if (countries) {
      setRandomCountry(getRandomCountry(countries));
    }
  }, [countries]);

  useEffect(() => {
    setQuestionCountry(randomCountry);
  }, [randomCountry]);

  useEffect(() => {
    if (state.gameInfo.currentQuestion === state.gameInfo.totalQuestions) {
      dispatch({ type: 'SET_GAME_OVER', payload: true });
    }
  }, [state.gameInfo.currentQuestion, state.gameInfo.totalQuestions, dispatch]);

  if (!questionCountry || !countries) {
    return <div className=''>Getting Countries... </div>;
  }

  const options = getRandomOptions(countries, questionCountry, 4);
  function handleClick(name: string) {
    console.log('from click option', name);
    console.log('from correct random', questionCountry?.name.common);
    if (name === questionCountry?.name.common) {
      console.log('correct');
      dispatch({ type: 'SET_SCORE' });
    } else {
      console.log('wrong');
    }
    if (countries) {
      setQuestionCountry(getRandomCountry(countries));
      dispatch({ type: 'INCREMENT_QUESTION' });
    }
  }
  return (
    <div>
      {state.gameInfo.isGameOver ? (
        <GameEnd />
      ) : (
        <div className='container flex flex-col items-center justify-center'>
          {/* <p>Time remaining: {remainingTime} seconds</p> */}
          <div>
            <img
              src={questionCountry?.flags.svg}
              alt={questionCountry?.flags.alt}
              className='size-40 m-2'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {options.map((country, index) => (
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
  );
};

export default SinglePlayerGameInterface;

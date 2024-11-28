import { useContext, useEffect, useState, useRef } from 'react';
import {
  getRandomCountry,
  getRandomOptions,
  toastOptions,
} from '../utils/helpers';
import { GlobalContext } from '../GlobalContext';
import GameEnd from './GameEnd';
import { Country } from '../types/appTypes';
import { toast } from 'react-toastify';

const SinglePlayerGameInterface = () => {
  const [questionCountry, setQuestionCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[] | null>(null);
  const { state, dispatch } = useContext(GlobalContext);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function getNextQuestion() {
    clearTimeout(timerRef.current);
    let country: Country;
    let options: Country[];
    if (countries) {
      country = getRandomCountry(countries);
      options = getRandomOptions(countries, country, 4);
      setQuestionCountry(country);
      setOptions(options);
    }
    dispatch({ type: 'INCREMENT_QUESTION' });
    startTimer();
  }

  useEffect(() => {
    if (isTimeOut) {
      getNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeOut]);

  // Function to handle the timer
  const startTimer = () => {
    setIsTimeOut(false);
    setRemainingTime(10); // Reset timer to 10 seconds

    const countdown = (time: number) => {
      if (time < 0) {
        clearTimeout(timerRef.current);
        setIsTimeOut(true);

        // Cleanup should be done correctly
        return;
      }
      setRemainingTime(time);
      timerRef.current = setTimeout(() => countdown(time - 1), 1000); // Set the next timeout
    };

    countdown(10); // Start the countdown with 10 seconds
  };

  async function fetchCountriesData() {
    // const response = await axios.get('https://restcountries.com/v3.1/all');
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCountries(data);
      })
      .catch((error) => console.error('Fetch error:', error));
  }
  useEffect(() => {
    fetchCountriesData();
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current); // Cleanup the timer when the component unmounts
      }
    };
  }, []);

  useEffect(() => {
    if (countries) {
      setQuestionCountry(getRandomCountry(countries));
    }
  }, [countries]);

  useEffect(() => {
    if (countries && questionCountry) {
      setOptions(getRandomOptions(countries, questionCountry, 4));
    }
  }, [countries, questionCountry]);

  useEffect(() => {
    if (state.gameInfo.currentQuestion > state.gameInfo.totalQuestions) {
      dispatch({ type: 'SET_GAME_OVER', payload: true });
    }
  }, [state.gameInfo.currentQuestion, state.gameInfo.totalQuestions, dispatch]);

  if (!questionCountry || !countries) {
    return <div className=''>Getting Countries... </div>;
  }

  function handleClick(name: string) {
    clearTimeout(timerRef.current);
    if (name === questionCountry?.name.common) {
      toast.success('correct', toastOptions);
      dispatch({ type: 'SET_SCORE' });
    } else {
      toast.error('Incorrect', toastOptions);
    }

    getNextQuestion();
  }
  if (state.gameInfo.isGameOver) {
    clearTimeout(timerRef.current);
  }
  return (
    <div>
      {state.gameInfo.isGameOver ? (
        <GameEnd />
      ) : (
        <div className='container flex flex-col items-center justify-center'>
          <p
            className={`${
              remainingTime < 6 ? 'text-red-600' : 'text-green-600'
            }`}>
            {remainingTime} seconds
          </p>
          <div>
            <img
              src={questionCountry?.flags.svg}
              alt={questionCountry?.flags.alt}
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
  );
};

export default SinglePlayerGameInterface;

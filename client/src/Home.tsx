import { useEffect, useState } from 'react';
// import {  SocketContext } from './SocketContext';
import GameInterface from './components/GameInterface';
import axios from 'axios';

import { getRandomCountry } from './utils/helpers';
import ScoreBoard from './components/ScoreBoard';
import GameHeader from './components/GameHeader';

// Define the type of a country object based on the API response
export interface Country {
  name: {
    common: string;
  };
  capital: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  // Add other properties you're interested in
}

const Home = () => {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  // const { socket } = useContext(SocketContext);

  async function fetchCountriesData() {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    console.log(response.data);
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
  return (
    <>
      <GameHeader />
      <GameInterface country={randomCountry} countries={countries} />
      <ScoreBoard />
    </>
  );
};

export default Home;

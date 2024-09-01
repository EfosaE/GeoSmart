import axios from 'axios';
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

export const getCountries = async () => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data;

    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const getRandomCountry = async (countries: Country[]) => {
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
};

export function getRandomOptions(
  countries: Country[],
  correctCountry: Country,
  numberOfOptions: number
): Country[] {
  const options = [correctCountry];
  const countriesCopy = [...countries];

  // Remove the correct country from the list to avoid duplicates
  const correctCountryIndex = countriesCopy.findIndex(
    (country) => country.name.common === correctCountry.name.common
  );
  countriesCopy.splice(correctCountryIndex, 1);

  // Add random incorrect options
  while (options.length < numberOfOptions) {
    const randomIndex = Math.floor(Math.random() * countriesCopy.length);
    const randomCountry = countriesCopy.splice(randomIndex, 1)[0];
    options.push(randomCountry);
  }

  // Shuffle the options array
  return options.sort(() => Math.random() - 0.5);
}

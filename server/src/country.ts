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

export let countries: Country[] = [];

export const getCountries = async (retries = 3, delay = 1000) => {
  if (countries.length > 0) {
    return countries; // Return cached countries if already fetched
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      countries = response.data;
      return countries;
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retrying (${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
      } else {
        console.error('Error fetching countries:', error);
        throw error; // Throw error after all retries fail
      }
    }
  }
};


// export const getRandomCountry = async (countries: Country[]) => {
//   const randomIndex = Math.floor(Math.random() * countries.length);
//   return countries[randomIndex];
// };
export const getRandomCountry = () => {
  if (countries.length === 0) {
    throw new Error('Countries data not loaded');
  }
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
};

export function getRandomOptions(
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

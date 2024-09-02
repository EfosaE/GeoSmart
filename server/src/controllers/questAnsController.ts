import { getCountries, getRandomCountry, getRandomOptions } from '../country';

export async function getQuestion() {
  const countries = await getCountries();
  const country = await getRandomCountry(countries);

  const options = getRandomOptions(countries, country, 4);

  return { country, options };
}

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

export type Player = {
  name: string;
  isReady: boolean;
  score: number;
};
export interface PlayerScore {
  name: string;
  score: number;
}
export interface Room {
  answered: boolean;
  correctAnswer: string;
  numberOfPlayers: number;
  players: Player[];
}
// Type for data received for the question
export type Data = {
  country: Country;
  options: Country[];
};

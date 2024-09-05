import {
  MultiPlayerScoreBoard,
  SinglePlayerScoreBoard,
} from './components/ScoreBoard';
import GameHeader from './components/GameHeader';
import SinglePlayerGameInterface from './components/SinglePlayerGameInterface';
import { useContext } from 'react';
import { GlobalContext } from './GlobalContext';
import MultiPlayerGameInterface from './components/MultiPlayerGameInterface';

const Home = () => {
  const { state } = useContext(GlobalContext);
  return (
    <>
      <GameHeader />
      {state.gameMode.mode === 'single' && <SinglePlayerGameInterface />}

      {state.gameMode.mode === 'multi'&& state.gameInfo.isGameStarted && (
        <MultiPlayerGameInterface />
      )}

      {state.gameMode.mode === 'single' ? (
        <SinglePlayerScoreBoard />
      ) : (
        <MultiPlayerScoreBoard />
      )}
    </>
  );
};

export default Home;

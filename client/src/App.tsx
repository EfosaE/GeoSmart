import { useContext } from 'react';
import { GlobalContext } from './GlobalContext';
import Home from './Home';
import GameInit from './components/GameInit';
import Header from './components/Header';

const App = () => {
  const { state } = useContext(GlobalContext);
  return (
    <>
      <Header />
      {state.gameInfo.isGameStarted ? <Home /> : <GameInit />}
    </>
  );
};

export default App;

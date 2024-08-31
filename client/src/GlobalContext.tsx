import { createContext, ReactNode, useEffect, useReducer } from 'react';
import { ActionType } from './types';
import { AppReducer } from './AppReducer';
import { INITIAL_STATE } from './utils/helpers';



// Inititalize my dispatch function
const noop = () => {};

export const GlobalContext = createContext({
  state: INITIAL_STATE,
  dispatch: noop as React.Dispatch<ActionType>,
});

const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AppReducer, INITIAL_STATE);
  // Handle disconnect and clean up when component unmounts
  useEffect(() => {
    return () => {
      if (state.socket) {
        state.socket.off('message'); // Clean up specific event listeners
        state.socket.disconnect(); // Disconnect socket
        dispatch({ type: 'SET_SOCKET', payload: null }); // Reset socket in state
        console.log('Socket disconnected and cleaned up.');
      }
    };
  }, [state.socket, dispatch]);
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;

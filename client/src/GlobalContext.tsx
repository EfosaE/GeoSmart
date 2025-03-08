import { createContext, ReactNode, useEffect, useReducer } from "react";
import { ActionType } from "./types";
import { AppReducer } from "./AppReducer";
import { INITIAL_STATE } from "./utils/helpers";

// Inititalize my dispatch function
const noop = () => {};

export const GlobalContext = createContext({
  state: INITIAL_STATE,
  dispatch: noop as React.Dispatch<ActionType>,
});

const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AppReducer, INITIAL_STATE);

  useEffect(() => {
    state.socket?.on("playerLeft", () => {
      dispatch({ type: "SET_GAME_OVER", payload: true });
    });

    if (
      state.gameInfo.isGameOver ||
      state.gameInfo.currentQuestion > state.gameInfo.totalQuestions
    ) {
      state.socket?.emit("gameOver", state.gameInfo.roomID);
    }
  }, [
    state.gameInfo.currentQuestion,
    state.gameInfo.isGameOver,
    state.gameInfo.roomID,
    state.gameInfo.totalQuestions,
    state.socket,
  ]);

  // Handle disconnect and clean up when component unmounts
  useEffect(() => {
    return () => {
      if (state.socket) {
        // Send a custom event to notify server before socket disconnects
        state.socket.emit(
          "playerDisconnect",
          state.gameInfo.roomID,
          state.playerName
        );
        state.socket.off("message"); // Clean up specific event listeners
        state.socket.disconnect(); // Disconnect socket
        dispatch({ type: "SET_SOCKET", payload: null }); // Reset socket in state
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.socket, dispatch]);
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;

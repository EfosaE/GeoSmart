import { useContext, useEffect, useRef, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import { io, Socket } from 'socket.io-client';
import { getRandomString } from '../utils/helpers';
import Lobby from '../Lobby';
import { toast } from 'react-toastify';

const GameInit = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [createdRoom, setCreatedRoom] = useState<string>('');
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const idRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleInputChange = () => {
    const idValue = idRef.current?.value || '';
    const nameValue = nameRef.current?.value || '';
    setIsDisabled(idValue.trim() === '' || nameValue.trim() === '');
  };

  let serverUrl: string;
  if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    serverUrl = import.meta.env.VITE_DEV_SERVER_URL;
  } else {
    serverUrl = import.meta.env.VITE_PROD_SERVER_URL;
  }

  useEffect(() => {
    console.log(state.socket);
  }, [state.socket]);

  const connectSocket = (): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      if (!state.socket) {
        const newSocket = io(`${serverUrl}`, {
          transports: ['websocket', 'polling'],
        });

        // Dispatch the new socket connection to your state
        dispatch({ type: 'SET_SOCKET', payload: newSocket });

        // If the connection succeeds, resolve the promise
        newSocket.on('connect', () => {
          resolve(newSocket);
        });

        // Handle connection errors and reject the promise
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newSocket.on('connect_error', (err: any) => {
          reject(new Error(`Connection failed: ${err.message}`));
        });
      } else {
        // If the socket already exists, resolve immediately
        resolve(state.socket);
      }
    });
  };

  async function handleGameStart() {
    setIsCreateLoading(true);

    dispatch({
      type: 'SET_HOST',
      payload: true,
    });

    try {
      const socket = await connectSocket();
      console.log(socket);
      if (socket.connected) {
        const roomID = getRandomString();
        setCreatedRoom(roomID);
        dispatch({
          type: 'SET_ROOM_ID',
          payload: roomID,
        });
        socket?.emit('create-game', roomID, state.gameInfo.noOfPlayers);
        socket?.on('gameCreated', (obj) => {
          if (obj.success) {
            toast.success('Room Created Successfully');
          } else {
            toast.error('An error occurred');
          }

          // for more than 2 players
          // dispatch({type:'SET_NO_PLAYERS', payload:obj.room.noOfPlayers})
        });
      } else {
        dispatch({ type: 'SET_SOCKET', payload: null });
      }
    } catch (error) {
      if (error) toast.error('Connection failed, please try again');
    } finally {
      setIsCreateLoading(false);
    }
  }

  async function handleGameJoin() {
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING', payload: true });
    const gameID = idRef.current?.value.trim();

    // this is to ensure i know who initiated the room on the client
    if (gameID !== createdRoom && createdRoom !== '') {
      toast.error('You cannot create and abandon a room');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const playerName = nameRef.current?.value.trim();
    const socket = await connectSocket();

    if (gameID)
      dispatch({
        type: 'SET_ROOM_ID',
        payload: gameID,
      });

    if (socket && playerName) {
      socket.emit('join-game', gameID, playerName);
      socket.on('joinedGame', (obj) => {
        if (!obj.success) {
          dispatch({ type: 'SET_ERROR', payload: obj.message });
          return;
        }
        dispatch({
          type: 'SET_PLAYER_NAME',
          payload: playerName,
        });
        socket.emit('sendPlayerToLobby', playerName, gameID);
        dispatch({ type: 'SET_GAME_MODE', payload: 'multi' });
        dispatch({ type: 'PROCEED_TO_LOBBY', payload: true });
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
  return (
    <>
      {state.gameInfo.atLobby ? (
        <Lobby />
      ) : (
        <div className='container flex flex-col justify-center items-center gap-4'>
          <div className='flex flex-col justify-center gap-6'>
            <div>
              <p className='text-violet-700 font-bold text-lg'></p>
              <button
                className='rounded-md py-2 px-3 bg-indigo-600 text-white my-4'
                onClick={() => {
                  dispatch({ type: 'SET_GAME_MODE', payload: 'single' });
                  dispatch({ type: 'SET_GAME_START', payload: true });
                }}>
                Start Game
              </button>
            </div>
            <div>
              <p className='text-violet-700 font-bold text-lg'>Multi Player:</p>
              <label htmlFor='noOfPlayers' className='flex my-2 gap-2'>
                <p className='font-light'>No of Players:</p>
                <select
                  name='noOfPlayers'
                  id=''
                  onChange={(e) => {
                    dispatch({
                      type: 'SET_NO_PLAYERS',
                      payload: +e.target.value,
                    });
                  }}>
                  <option value=''>select</option>
                  <option value='2'>2</option>
                  {/* <option value='3'>3</option> */}
                </select>
              </label>
              <div className='flex flex-col gap-2'>
                <button
                  className='rounded-md py-2 px-3 bg-indigo-600 text-white cursor-pointer disabled:opacity-50'
                  onClick={handleGameStart}
                  disabled={isCreateLoading || state.gameInfo.noOfPlayers < 2}>
                  {isCreateLoading ? 'Creating' : 'Create Game'}
                </button>
                <p>
                  Room ID:{' '}
                  {state.gameInfo.roomID && (
                    <span className='text-green-500'>
                      {state.gameInfo.roomID}
                    </span>
                  )}
                </p>
              </div>

              <div className='flex flex-col gap-2 mt-4'>
                <div className='flex flex-col gap-2 my-4'>
                  <input
                    type='text'
                    ref={nameRef}
                    placeholder='Enter your game name'
                    className='bg-blue-100 bg-opacity-25 px-3 py-2'
                    onChange={handleInputChange}
                  />
                  <input
                    type='text'
                    ref={idRef}
                    placeholder='Enter a room ID'
                    className='bg-blue-100 bg-opacity-25 px-3 py-2'
                    onChange={handleInputChange}
                  />
                  {state.error && (
                    <p className='text-red-500 text-center'>{state.error}</p>
                  )}
                  <button
                    className='rounded-md py-2 px-3 bg-blue-100  text-indigo-500 disabled:opacity-50 cursor-pointer'
                    disabled={isDisabled || state.isLoading}
                    onClick={handleGameJoin}>
                    {state.isLoading ? 'Joining...' : 'Join Game'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='w-fit overflow-hidden'>
            <p className='text-blue-400 text-sm whitespace-nowrap animate-marquee'>
              Note: I am using a free server instance so connection would take
              time and may fail on first try.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GameInit;

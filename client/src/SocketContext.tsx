// // SocketContext.tsx
// import React, { createContext, useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';

// const SOCKET_SERVER_URL = 'http://localhost:3000';

// export interface SocketContextType {
//   socket: Socket | null;
// }

// export const SocketContext = createContext<SocketContextType>({ socket: null });

// export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     const newSocket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
//     setSocket(newSocket);

//     // Cleanup function to disconnect socket if needed
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

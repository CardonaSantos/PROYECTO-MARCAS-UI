import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useStore } from "./ContextSucursal";

// Creamos el contexto
type SocketContextType = Socket | null;
const SocketContext = createContext<SocketContextType>(null);
// const API_URL = "wss://server-production-nest-production.up.railway.app"; // Asegúrate de que este sea el correcto
// const API_URL = "http://localhost:3000/";
const API_URL = import.meta.env.VITE_API_URL;

// Hook personalizado para acceder al contexto
export const useSocket = () => {
  return useContext(SocketContext);
};

// Proveedor de contexto que manejará la conexión de Socket.IO
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType>(null);

  const userId = useStore((state) => state.userId);
  const userRol = useStore((state) => state.userRol);

  useEffect(() => {
    if (userId && userRol) {
      const newSocket = io(`${API_URL}`, {
        query: { userId: userId, role: userRol },

        transports: ["websocket"],
        reconnection: true, // Habilitar reconexión automática
        reconnectionAttempts: 5, // Intentos de reconexión
        reconnectionDelay: 1000, // Intervalo entre intentos
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket conectado:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Error en la conexión del socket:", error.message);
      });

      // Manejo de reconexión automática
      newSocket.on("reconnect", () => {
        console.log("Socket reconectado:", newSocket.id);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId, userRol]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

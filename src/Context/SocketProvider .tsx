import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const socketRef = useRef<Socket | null>(null); // Usar useRef para evitar recreaciones innecesarias

  const userId = useStore((state) => state.userId);
  const userRol = useStore((state) => state.userRol);

  useEffect(() => {
    if (!userId || !userRol) return;

    // Evitar múltiples conexiones al cambiar userId/userRol
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(API_URL, {
      query: {
        userId: userId.toString(),
        role: userRol,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketRef.current = newSocket; // Guardar referencia al socket

    // Función para actualizar query params
    const updateQuery = () => {
      if (newSocket) {
        newSocket.io.opts.query = {
          userId: userId.toString(),
          role: userRol,
        };
      }
    };

    // Manejo de eventos
    newSocket
      .on("connect", () => {
        console.log("Conectado:", newSocket.id);
        updateQuery();
      })
      .on("reconnect", (attempt) => {
        console.log("Reconectado (intento %d)", attempt);
        updateQuery();
      })
      .on("reconnect_attempt", (attempt) => {
        console.log("Reintentando conexión (%d)...", attempt);
        updateQuery();
      })
      .on("reconnect_failed", () => {
        console.error("Reconexión fallida");
      })
      .on("disconnect", (reason) => {
        console.log("Desconectado:", reason);
      });

    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, userRol]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

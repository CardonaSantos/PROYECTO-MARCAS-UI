// GlobalSocketListener.tsx
import { useEffect } from "react";
import { useStore } from "@/Context/ContextSucursal";
import { useSocket } from "@/Context/SocketProvider ";
type GlobalSocketListenerProps = {
  children: React.ReactNode;
};

const GlobalSocketListener = ({ children }: GlobalSocketListenerProps) => {
  const socket = useSocket();
  const userId = useStore((state) => state.userId);
  const userRol = useStore((state) => state.userRol);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleConnect = () => {
      console.log("Re-registro automático en socket conectado:", userId);
      socket.emit("registerUser", Number(userId));
      socket.io.opts.query = {
        userId: userId.toString(),
        role: userRol,
      };
    };

    const handleNotification = (newNotification: any) => {
      // Aquí puedes agregar la lógica global para notificaciones, por ejemplo, actualizar un store global.
      console.log("Notificación recibida global:", newNotification);
    };

    socket.on("connect", handleConnect);
    socket.on("newNotificationToSeller", handleNotification);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newNotificationToSeller", handleNotification);
    };
  }, [socket, userId, userRol]);

  return <>{children}</>;
};

export default GlobalSocketListener;

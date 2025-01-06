import { useEffect, useState } from "react";
import { Bell, User, LogOut, MailIcon, CircleX } from "lucide-react";
import { Button } from "../ui/button";
import { Link, Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

import logo from "../../assets/images/logoEmpresa.png";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../../Context/SocketProvider ";
import axios from "axios";
import { toast } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { useStore } from "@/Context/ContextSucursal";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout2({ children }: LayoutProps) {
  const socket = useSocket(); // Hook que retorna la instancia del WebSocket
  const [locationInterval, setLocationInterval] =
    useState<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    // Aquí manejas el cierre de sesión
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // O redirecciona al login
  };

  interface UserTokenInfo {
    nombre: string;
    correo: string;
    rol: string;
    sub: number;
    activo: boolean;
  }

  const [tokenUser, setTokenUser] = useState<UserTokenInfo | null>(null);
  const setUserNombre = useStore((state) => state.setUserNombre);
  const setUserCorreo = useStore((state) => state.setUserCorreo);
  const setRol = useStore((state) => state.setRol);
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
        setTokenUser(decodedToken);
        setUserNombre(decodedToken.nombre);
        setUserCorreo(decodedToken.correo);
        setRol(decodedToken.rol);
        setUserId(Number(decodedToken.sub));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const sendMyLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        if (socket && tokenUser) {
          const locationData = {
            latitud: latitude,
            longitud: longitude,
            usuarioId: tokenUser.sub,
          };

          console.log("Enviando ubicación:", locationData);
          socket.emit("sendLocation", locationData);
        }
      });
    } else {
      console.error("Geolocation no está disponible en este navegador.");
    }
  };

  useEffect(() => {
    if (socket && tokenUser && tokenUser.rol === "VENDEDOR") {
      // Configurar intervalo para enviar la ubicación cada 30 segundos (30000ms)
      const interval = setInterval(() => {
        sendMyLocation();
      }, 5000);
      setLocationInterval(interval);
      // Limpiar el intervalo al desmontar el componente o al desconectar
      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }
  }, [socket, tokenUser]);

  interface Notification {
    id: number; // El ID de la notificación en la base de datos
    mensaje: string; // El mensaje de la notificación
    leido: boolean; // Estado de la notificación (si ha sido leída o no)
    remitenteId?: number; // El ID del remitente (opcional)
    creadoEn: Date; // Fecha de creación de la notificación
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);

  //VERIFICAR QUE SE ESTÁ CONECTADO, TENGO EL SOCKET Y ES ADMIN
  useEffect(() => {
    if (socket && tokenUser?.rol === "ADMIN") {
      socket.on("newNotification", (newNotification: Notification) => {
        setNotifications((previaNotification) => [
          ...previaNotification,
          newNotification,
        ]);
      });
    }

    return () => {
      if (socket) {
        socket.off("newNotification");
      }
    };
  }, [socket]);

  const getNoti = async () => {
    if (tokenUser?.rol === "ADMIN") {
      try {
        const response = await axios.get(
          `${API_URL}/notifications/notifications/for-admin/${tokenUser.sub}`
        );
        if (response.status === 200) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const getNoti = async () => {
      if (tokenUser?.rol === "ADMIN") {
        try {
          const response = await axios.get(
            `${API_URL}/notifications/notifications/for-admin/${tokenUser.sub}`
          );
          if (response.status === 200) {
            setNotifications(response.data);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    getNoti();
  }, [tokenUser]);

  console.log("Las notificaciones actuales son:", notifications);

  const handleVisto = async (notificationId: number) => {
    try {
      const response = await axios.patch(
        `${API_URL}/notifications/update-notify/${notificationId}`,
        {
          usuarioId: tokenUser?.sub,
        }
      );

      if (response.status === 200) {
        toast.success("Notificación eliminada");
        getNoti();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/notifications/delete-all-notifications-admin/${tokenUser?.sub}`
      );
      if (response.status === 200) {
        toast.success("Notificaciones eliminadas");
        getNoti();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al eliminar notificaciones");
    }
  };

  useEffect(() => {
    if (socket) {
      // Escuchar el evento específico para vendedores
      socket.on("newNotificationToSeller", (newNotification) => {
        console.log(
          "La notificación entrante para vendedor es: ",
          newNotification
        );

        setNotifications((previaNotification) => [
          ...previaNotification,
          newNotification,
        ]);
      });

      // Limpiar el evento al desmontar el componente
      return () => {
        socket.off("newNotificationToSeller"); // Limpiar el evento específico para vendedores
      };
    }
  }, [socket, tokenUser]); // Añadir tokenUser como dependencia para actualizar si cambia

  console.log("Mis notificaciones como vendedor son: ", notifications);

  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />

        {/* Contenedor principal para el toolbar y el contenido */}
        <div className="flex flex-col w-full">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 h-16 w-full bg-background border-b border-border shadow-sm flex items-center justify-between">
            <div className="mx-auto flex h-16 max-w-7xl w-full items-center px-4 sm:px-6 lg:px-8 justify-between">
              {/* Sección izquierda: Logo y nombre de la sucursal */}
              <div className="flex items-center space-x-2">
                <Link to={"/"}>
                  <img className="h-16 w-28" src={logo} alt="Logo" />
                </Link>
                <Link to={"/"}>
                  <h2 className="text-lg font-semibold text-foreground">
                    Marcas Guatemala
                  </h2>
                </Link>
              </div>

              {/* Sección derecha: Toggle de modo, notificaciones y menú de usuario */}
              <div className="flex items-center">
                <div className="flex justify-center items-center p-4">
                  <ModeToggle />
                </div>
                <Dialog>
                  {tokenUser ? (
                    <DialogTrigger asChild>
                      <button className="relative mr-4 rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <Bell className="h-6 w-6" />
                        {notifications.length > 0 && (
                          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {notifications.length}
                          </span>
                        )}
                      </button>
                    </DialogTrigger>
                  ) : null}
                  <DialogContent className="h-5/6 flex flex-col overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Notificaciones</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications
                          .sort(
                            (a, b) =>
                              new Date(b.creadoEn).getTime() -
                              new Date(a.creadoEn).getTime()
                          )
                          .map((not) => (
                            <div
                              key={not.id}
                              className="py-2 px-4 flex flex-col items-start border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              <p className="text-foreground text-sm mb-1">
                                {not.mensaje}
                              </p>
                              <div className="flex justify-between w-full items-center">
                                <p
                                  style={{ fontSize: "10px" }}
                                  className="text-gray-500"
                                >
                                  {not.creadoEn
                                    ? new Date(not.creadoEn).toLocaleString(
                                        "es-GT",
                                        {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                          hour12: true,
                                        }
                                      )
                                    : ""}
                                </p>

                                <div className="flex gap-2">
                                  {tokenUser?.rol === "ADMIN" ? (
                                    <Button
                                      onClick={() =>
                                        handleVisto(Number(not.id))
                                      }
                                      size={"sm"}
                                      className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-md"
                                    >
                                      <CircleX />
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-gray-500">
                          No hay notificaciones
                        </p>
                      )}
                    </div>

                    {/* Sticky footer */}
                    {notifications && notifications.length >= 1 ? (
                      <DialogFooter className="sticky bottom-0 p-1 shadow-md">
                        {tokenUser?.rol === "ADMIN" ? (
                          <Button onClick={handleDeleteAllNotifications}>
                            Limpiar todo
                          </Button>
                        ) : null}
                      </DialogFooter>
                    ) : null}
                  </DialogContent>
                </Dialog>

                {/* Menú desplegable para el avatar de usuario */}
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="default">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>{tokenUser?.nombre}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MailIcon className="mr-2 h-4 w-4" />
                        <span>{tokenUser?.correo}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span onClick={handleLogout}>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-1 lg:p-8">
            <SidebarTrigger />
            {children || <Outlet />}
          </main>

          {/* Footer */}
          <footer className="bg-background py-4 text-center text-sm text-muted-foreground border-t border-border">
            <p>
              &copy; ${new Date().getFullYear()} Marcas Guatemala. Todos los
              derechos reservados
            </p>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}

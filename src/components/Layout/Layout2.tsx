import { useEffect, useState } from "react";
import {
  Bell,
  User,
  LogOut,
  MailIcon,
  AlertCircle,
  Clock,
  Trash2,
  X,
} from "lucide-react";
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
import { Separator } from "@radix-ui/react-select";
import message1 from "../../assets/Sounds/message1.mp3";
import logoEmpresa from "../../assets/images/logoEmpresa.png";
import { useNotifications } from "@/Context/ContextNotifications";

interface LayoutProps {
  children?: React.ReactNode;
}

interface UserTokenInfo {
  nombre: string;
  correo: string;
  rol: string;
  sub: number;
  activo: boolean;
  empresaId: number;
}
interface Notification {
  id: number; // El ID de la notificación en la base de datos
  mensaje: string; // El mensaje de la notificación
  leido: boolean; // Estado de la notificación (si ha sido leída o no)
  remitenteId?: number; // El ID del remitente (opcional)
  creadoEn: Date; // Fecha de creación de la notificación
  targetUserId: number;
}

export default function Layout2({ children }: LayoutProps) {
  const socket = useSocket(); // Hook que retorna la instancia del WebSocket
  // const userRol = useStore((state) => state.userRol);
  const userId = useStore((state) => state.userId) ?? 0;
  const userRol = useStore((state) => state.userRol);
  const [tokenUser, setTokenUser] = useState<UserTokenInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Funciones para la store global
  const setUserNombre = useStore((state) => state.setUserNombre);
  const setUserCorreo = useStore((state) => state.setUserCorreo);
  const setRol = useStore((state) => state.setRol);
  const setUserId = useStore((state) => state.setUserId);
  const setEmpresaId = useStore((state) => state.setSucursalId);

  // Manejo de cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // O redirecciona al login
  };

  // Decodificar token y guardar datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
        setUserNombre(decodedToken.nombre);
        setUserCorreo(decodedToken.correo);
        setRol(decodedToken.rol);
        setUserId(Number(decodedToken.sub));
        setEmpresaId(decodedToken.empresaId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Función para enviar ubicación del usuario
  // const sendMyLocation = async () => {
  //   if (!navigator.geolocation) {
  //     console.error("Geolocation no está disponible en este navegador.");
  //     toast.info("Geolocation no está disponible en este navegador.");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition((position) => {
  //     if (socket && userId) {
  //       const locationData = {
  //         latitud: position.coords.latitude,
  //         longitud: position.coords.longitude,
  //         usuarioId: userId,
  //       };
  //       // console.log("Enviando ubicación:", locationData);
  //       socket.emit("sendLocation", locationData);
  //     }
  //   });
  // };

  // Enviar ubicación cada 5 segundos si el usuario es vendedor
  // useEffect(() => {
  //   if (socket && userRol === "VENDEDOR") {
  //     const interval = setInterval(() => {
  //       sendMyLocation();
  //     }, 3000);

  //     return () => clearInterval(interval); // Limpia correctamente el intervalo
  //   }
  // }, [socket, userId]);

  useEffect(() => {
    if (!navigator.geolocation || !socket || userRol !== "VENDEDOR") return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          usuarioId: userId,
        };
        socket.emit("sendLocation", locationData);
      },
      (error) => console.error("Error obteniendo ubicación", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, userId]);

  // Obtener notificaciones desde el backend
  const getNoti = async () => {
    if (tokenUser) {
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

  // Cargar notificaciones al iniciar sesión
  useEffect(() => {
    getNoti();
  }, [tokenUser]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleAdminNotification = (newNotification: Notification) => {
      if (
        newNotification.targetUserId &&
        newNotification.targetUserId !== userId
      ) {
        return; // Ignorar notificaciones que no sean para este usuario
      }

      setNotifications((prev) => [...prev, newNotification]);
      toast.message(newNotification.mensaje);

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        new Notification("Nueva Notificación", {
          body: newNotification.mensaje,
          icon: logoEmpresa,
          badge: logoEmpresa,
        });
      }

      const audioNotificacion = new Audio(message1);
      audioNotificacion.play();
    };

    socket.on("newNotification", handleAdminNotification);
    return () => {
      socket.off("newNotification", handleAdminNotification);
    };
  }, [socket, userId]); // Agregado userId para que se actualice correctamente

  // En tu componente Layout2 o contexto
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleSellerNotification = (newNotification: Notification) => {
  //     setNotifications((prev) => [...prev, newNotification]);

  //     if (Notification.permission !== "granted") {
  //       Notification.requestPermission();
  //     }

  //     if (Notification.permission === "granted") {
  //       new Notification("Nueva Notificación", {
  //         body: newNotification.mensaje,
  //         icon: logoEmpresa,
  //         badge: logoEmpresa,
  //       });
  //     }

  //     const audioNotificacion = new Audio(message1);
  //     audioNotificacion.play();
  //   };

  //   socket.on("newNotificationToSeller", handleSellerNotification);

  //   return () => {
  //     socket.off("newNotificationToSeller", handleSellerNotification);
  //   };
  // }, [socket]);

  // Escuchar nuevas notificaciones para vendedores
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleNewNotification = (newNotification: Notification) => {
  //     console.log(
  //       "La notificación entrante para vendedor es:",
  //       newNotification
  //     );
  //     setNotifications((prev) => [...prev, newNotification]);
  //   };

  //   socket.on("newNotificationToSeller", handleNewNotification);

  //   return () => {
  //     socket.off("newNotificationToSeller", handleNewNotification);
  //   };
  // }, [socket, tokenUser]);

  // useEffect(() => {
  //   if (!socket || !userId) return;

  //   const handleConnect = () => {
  //     console.log("Re-registrando usuario:", userId, "Socket ID:", socket.id);
  //     socket.emit("registerUser", Number(userId)); // Forzar re-registro
  //   };

  //   const handleNotification = (newNotification: Notification) => {
  //     console.log(
  //       "La notificación entrante para vendedor es:",
  //       newNotification
  //     );
  //     setNotifications((prev) => [...prev, newNotification]);

  //     if (Notification.permission !== "granted") {
  //       Notification.requestPermission();
  //     }

  //     if (Notification.permission === "granted") {
  //       new Notification("Nueva Notificación", {
  //         body: newNotification.mensaje,
  //         icon: logoEmpresa,
  //         badge: logoEmpresa,
  //       });
  //     }

  //     const audioNotificacion = new Audio(message1);
  //     audioNotificacion.play();
  //   };

  //   // Escuchar eventos (¡incluyendo reconexiones!)
  //   socket.on("connect", handleConnect);
  //   socket.on("newNotificationToSeller", handleNotification);

  //   // Registrar inmediatamente si ya está conectado
  //   if (socket.connected) handleConnect();

  //   // Limpiar listeners al desmontar o cambiar userId/socket
  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("newNotificationToSeller", handleNotification);
  //   };
  // }, [socket, userId]); // ¡Dependencias críticas aquí!

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

  // Eliminar todas las notificaciones
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

  // console.log("Mis notificaciones:", notifications);
  console.log("MI ACTUAL ID SOCKET ES: ", socket?.id);
  const notifications2 = useNotifications((state) => state.notifications);
  console.log("LAS NOTIFICACIONES DEL CONTEXTO SON: ", notifications2);

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
              <div className="flex items-center space-x-3">
                <ModeToggle />

                {tokenUser && (
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="relative">
                        <Bell className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {notifications.length}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] w-full">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center">
                          <Bell className="mr-2 h-5 w-5" />
                          Notificaciones
                        </DialogTitle>
                      </DialogHeader>
                      <Separator className="my-2" />
                      <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2 px-1">
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
                                className="flex items-start space-x-3 p-3 bg-card rounded-md shadow-sm hover:shadow transition-shadow duration-200 border border-border"
                              >
                                <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm text-card-foreground leading-relaxed">
                                    {not.mensaje}
                                  </p>
                                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
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
                                    </span>
                                    {tokenUser && (
                                      <Button
                                        onClick={() =>
                                          handleVisto(Number(not.id))
                                        }
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 bg-red-500 text-white"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            No hay notificaciones
                          </p>
                        )}
                      </div>
                      {notifications &&
                        notifications.length >= 1 &&
                        tokenUser && (
                          <>
                            <Separator className="my-2" />
                            <DialogFooter>
                              <Button
                                onClick={handleDeleteAllNotifications}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Limpiar notificaciones
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                    </DialogContent>
                  </Dialog>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Menú de usuario</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="flex items-center py-1.5">
                      <User className="mr-2 h-3 w-3" />
                      <span className="font-medium text-sm">
                        {tokenUser?.nombre}
                      </span>
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem className="flex items-center py-1.5">
                      <MailIcon className="mr-2 h-3 w-3" />
                      <span className="truncate text-xs">
                        {tokenUser?.correo}
                      </span>
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center text-red-500 focus:text-red-500 py-1.5"
                    >
                      <LogOut className="mr-2 h-3 w-3" />
                      <span className="text-sm">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              &copy;{new Date().getFullYear()} Marcas Guatemala. Todos los
              derechos reservados
            </p>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}

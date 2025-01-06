import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Home,
  Bell,
  User,
  LogOut,
  ShoppingBag,
  MailIcon,
  UserCheck,
  UserPlus,
  FileText,
  MapPin,
  X,
  Users,
  ShoppingCart,
  CheckSquare,
  Box,
  Shirt,
  PlusSquare,
  Grid,
  Tags,
  Package,
  ListCheck,
  CircleX,
  ClipboardList,
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

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
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
      }, 45000);
      setLocationInterval(interval);
      // Limpiar el intervalo al desmontar el componente o al desconectar
      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }
  }, [socket, tokenUser]);

  // path="/historial-visitas"

  const menuItems = [
    // { icon: Home, label: "Home", href: "/" },
    { icon: ShoppingBag, label: "Hacer venta", href: "/hacer-ventas" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: UserPlus, label: "Añadir cliente", href: "/crear-cliente" },
    { icon: ShoppingCart, label: "Historial Ventas", href: "/ventas" },
    { icon: FileText, label: "Historial Prospectos", href: "/historial-citas" },
    {
      icon: ClipboardList,
      label: "Historial Visitas",
      href: "/historial-visitas",
    },

    { icon: UserCheck, label: "Usuarios", href: "/usuarios" },
    { icon: User, label: "Empleados", href: "/empleados" },
    {
      icon: ListCheck,
      label: "Check Empleados",
      href: "/historial-empleados-check",
    },
    { icon: CheckSquare, label: "Check", href: "/registrar-entrada-salida" },
    { icon: Shirt, label: "Productos", href: "/ver-productos" },
    { icon: PlusSquare, label: "Crear productos", href: "/crear-productos" },
    { icon: Grid, label: "Inventario", href: "/asignar-stock" },
    { icon: Tags, label: "Categorias", href: "/crear-categoria" },
    { icon: Package, label: "Proveedores", href: "/crear-proveedor" },
    { icon: Box, label: "Registro de entregas", href: "/registro-entregas" },
    { icon: MapPin, label: "Visita", href: "/visita" },
    { icon: FileText, label: "Prospecto", href: "/prospecto" },
  ];

  const vendedorMenuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard-empleado" },

    { icon: ShoppingBag, label: "Hacer venta", href: "/hacer-ventas" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: CheckSquare, label: "Check", href: "/registrar-entrada-salida" },

    // { icon: UserPlus, label: "Añadir cliente", href: "/crear-cliente" },
    { icon: MapPin, label: "Visita", href: "/visita" },
    { icon: FileText, label: "Prospecto", href: "/prospecto" },
    { icon: ShoppingCart, label: "Mis Ventas", href: "/mis-ventas" },
  ];

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  //-------------------
  const sideMenuRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sideMenuRef.current &&
      !sideMenuRef.current.contains(event.target as Node)
    ) {
      if (!isDesktop && isSideMenuOpen) {
        toggleSideMenu(); // Cerrar el menú si se hace clic fuera de él
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktop, isSideMenuOpen]);
  //-----------------------------------
  // Muestra diferentes elementos del menú según el rol
  const getMenuItems = () => {
    if (tokenUser?.rol === "ADMIN") {
      return menuItems;
    } else if (tokenUser?.rol === "VENDEDOR") {
      return vendedorMenuItems;
    }
    return []; // En caso de que no tenga rol o rol no reconocido
  };

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
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-background shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              className="mr-4 rounded-md bg-secondary p-2 text-secondary-foreground hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 lg:hidden"
              onClick={toggleSideMenu}
            >
              {isSideMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="flex items-center">
              <a href={"/"} className="flex items-center">
                <img className="h-16 w-16" src={logo} alt="Logo Empresa" />
                <h2 className="ml-2 text-lg font-bold"> Marcas Guatemala</h2>
              </a>
            </div>
          </div>

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
                                  onClick={() => handleVisto(Number(not.id))}
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
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Side Menu */}
        <nav
          ref={sideMenuRef}
          className={`w-64 transform bg-background p-4 transition-transform duration-300 ease-in-out ${
            isDesktop || isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
          } fixed left-0 top-16 bottom-0 z-10 overflow-y-auto shadow-lg lg:relative lg:top-0 lg:translate-x-0 lg:shadow-none`}
        >
          <ul className="space-y-2">
            {tokenUser?.rol == "ADMIN" ? (
              <li>
                <a
                  className="flex items-center rounded-lg p-2 text-foreground hover:bg-muted"
                  href="/"
                >
                  <Home className="mr-3 h-6 w-6" />
                  Home
                </a>
              </li>
            ) : null}
            {getMenuItems().map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="flex items-center rounded-lg p-2 text-foreground hover:bg-muted"
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-full lg:max-w-6xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      <footer className="bg-background py-1 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Marcas Guatemala. Todos los derechos
          reservados
        </p>
      </footer>
    </div>
  );
}

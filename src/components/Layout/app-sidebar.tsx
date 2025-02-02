import {
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CalendarPlus,
  CheckSquare,
  ClipboardList,
  Clock,
  CreditCard,
  FileClock,
  FileSpreadsheet,
  FolderOpen,
  Home,
  KeyRound,
  MapPin,
  MapPinned,
  PackagePlus,
  PieChart,
  ShoppingBag,
  Star,
  Tags,
  Truck,
  UserCog,
  UserPlus,
  UserPlus2,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ShoppingCart, Users, Box } from "lucide-react";
import { useStore } from "@/Context/ContextSucursal";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const menuItems = [
  { icon: Home, label: "Página Principal", href: "/" },
  { icon: ShoppingBag, label: "Nueva Venta", href: "/hacer-ventas" },
  { icon: Users, label: "Directorio de Clientes", href: "/clientes" },
  { icon: UserPlus, label: "Registrar Cliente", href: "/crear-cliente" },
  { icon: ClipboardList, label: "Historial de Ventas", href: "/ventas" },
  { icon: CreditCard, label: "Gestión de Créditos", href: "/creditos" },
  {
    icon: Calendar,
    label: "Registro de Prospectos",
    href: "/historial-prospectos",
  },
  { icon: MapPin, label: "Registro de Visitas", href: "/historial-visitas" },
  { icon: UserCog, label: "Administración de Usuarios", href: "/usuarios" },
  { icon: MapPinned, label: "Ubicación de Empleados", href: "/empleados" },
  {
    icon: FileClock,
    label: "Control de Asistencia",
    href: "/historial-empleados-check",
  },
  {
    icon: Clock,
    label: "Registro de Jornada",
    href: "/registrar-entrada-salida",
  },
  { icon: Boxes, label: "Catálogo de Productos", href: "/ver-productos" },
  { icon: PackagePlus, label: "Nuevo Producto", href: "/crear-productos" },

  {
    icon: FolderOpen,
    label: "Seguimiento de Cancelaciones",
    href: "/seguimiento-de-cancelaciones",
  },

  { icon: BarChart3, label: "Control de Inventario", href: "/asignar-stock" },
  { icon: Tags, label: "Categorías de Productos", href: "/crear-categoria" },
  { icon: Truck, label: "Directorio de Proveedores", href: "/crear-proveedor" },
  { icon: Box, label: "Registro de Entregas", href: "/registro-entregas" },
  { icon: CalendarPlus, label: "Programar Visita", href: "/visita" },
  { icon: UserPlus2, label: "Nuevo Prospecto", href: "/prospecto" },
  { icon: PieChart, label: "Estadísticas y Gráficos", href: "/analisis" },
  { icon: FileSpreadsheet, label: "Informes y Reportes", href: "/reportes" },
  { icon: Wallet, label: "Balance de Cuentas", href: "/saldos" },
  { icon: KeyRound, label: "Restablecer Contraseña", href: "/recovery" },
  { icon: Building2, label: "Información Corporativa", href: "/empresa-info" },
];

const menuVendedor = [
  { icon: Home, label: "Inicio del Empleado", href: "/dashboard-empleado" },
  { icon: ShoppingBag, label: "Realizar Venta", href: "/hacer-ventas" },
  { icon: Users, label: "Gestión de Clientes", href: "/clientes" },
  {
    icon: CheckSquare,
    label: "Registro de Entrada/Salida",
    href: "/registrar-entrada-salida",
  },
  { icon: MapPin, label: "Registrar Visita", href: "/visita" },
  { icon: Star, label: "Registrar Prospecto", href: "/prospecto" },
  { icon: ShoppingCart, label: "Mis Ventas", href: "/mis-ventas" },
];
export function AppSidebar() {
  const rolUser = useStore((state) => state.userRol);

  function retornarRutas() {
    if (rolUser === "ADMIN") {
      return menuItems;
    } else {
      return menuVendedor;
    }
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent className="">
        <div className="overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Secciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {retornarRutas().map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <item.icon className="h-4 w-4 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

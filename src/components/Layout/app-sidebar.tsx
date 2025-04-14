// Sidebar organizado por grupos con accesibilidad y estética
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
  Home,
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

const adminGroups = [
  {
    label: "Dashboard",
    items: [
      { icon: Home, label: "Página Principal", href: "/" },
      { icon: PieChart, label: "Estadísticas y Gráficos", href: "/analisis" },
      {
        icon: FileSpreadsheet,
        label: "Informes y Reportes",
        href: "/reportes",
      },
      { icon: Wallet, label: "Balance de Cuentas", href: "/saldos" },
    ],
  },
  {
    label: "Ventas y Clientes",
    items: [
      { icon: ShoppingBag, label: "Nueva Venta", href: "/hacer-ventas" },
      { icon: ClipboardList, label: "Historial de Ventas", href: "/ventas" },
      { icon: Users, label: "Directorio de Clientes", href: "/clientes" },
      { icon: UserPlus, label: "Registrar Cliente", href: "/crear-cliente" },
      { icon: CreditCard, label: "Gestión de Créditos", href: "/creditos" },
    ],
  },
  {
    label: "Prospectos y Visitas",
    items: [
      {
        icon: Calendar,
        label: "Registro de Prospectos",
        href: "/historial-prospectos",
      },
      {
        icon: MapPin,
        label: "Registro de Visitas",
        href: "/historial-visitas",
      },
      { icon: CalendarPlus, label: "Programar Visita", href: "/visita" },
      { icon: UserPlus2, label: "Nuevo Prospecto", href: "/prospecto" },
    ],
  },
  {
    label: "Empleados",
    items: [
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
    ],
  },
  {
    label: "Inventario",
    items: [
      { icon: Boxes, label: "Catálogo de Productos", href: "/ver-productos" },
      { icon: PackagePlus, label: "Nuevo Producto", href: "/crear-productos" },
      {
        icon: Tags,
        label: "Categorías de Productos",
        href: "/crear-categoria",
      },
      {
        icon: BarChart3,
        label: "Control de Inventario",
        href: "/asignar-stock",
      },
      { icon: Truck, label: "Directorio de Proveedores", href: "/proveedor" },
      { icon: Box, label: "Registro de Entregas", href: "/registro-entregas" },
    ],
  },
  {
    label: "Empresa",
    items: [
      {
        icon: Building2,
        label: "Información Corporativa",
        href: "/empresa-info",
      },
    ],
  },
];

const vendedorRoutes = [
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

  const isAdmin = rolUser === "ADMIN";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <div className="overflow-y-auto">
          {isAdmin ? (
            adminGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.href}
                            className="flex items-center gap-2"
                          >
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
            ))
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Empleado</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {vendedorRoutes.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.href}
                          className="flex items-center gap-2"
                        >
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
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

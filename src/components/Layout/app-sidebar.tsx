import {
  Briefcase,
  ChartNoAxesCombinedIcon,
  CheckSquare,
  ClipboardList,
  FileText,
  Grid,
  Home,
  Info,
  LockKeyholeOpen,
  MapPin,
  PackageOpen,
  PlusSquare,
  Sheet,
  ShoppingBag,
  Star,
  Tags,
  UserCheck,
  UserPlus,
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
import { ShoppingCart, Package, Users, Box } from "lucide-react";
import { useStore } from "@/Context/ContextSucursal";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const menuItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: ShoppingBag, label: "Realizar Venta", href: "/hacer-ventas" },
  { icon: Users, label: "Gestión de Clientes", href: "/clientes" },
  { icon: UserPlus, label: "Nuevo Cliente", href: "/crear-cliente" },
  { icon: ShoppingCart, label: "Historial Ventas", href: "/ventas" },
  { icon: FileText, label: "Prospectos Registrados", href: "/historial-citas" },
  {
    icon: ClipboardList,
    label: "Visitas Realizadas",
    href: "/historial-visitas",
  },
  { icon: UserCheck, label: "Gestión de Usuarios", href: "/usuarios" },
  { icon: Briefcase, label: "Gestión de Empleados", href: "/empleados" },
  {
    icon: ClipboardList,
    label: "Check de Empleados",
    href: "/historial-empleados-check",
  },
  {
    icon: CheckSquare,
    label: "Registro de Entrada/Salida",
    href: "/registrar-entrada-salida",
  },
  { icon: PackageOpen, label: "Lista de Productos", href: "/ver-productos" },
  { icon: PlusSquare, label: "Agregar Producto", href: "/crear-productos" },
  { icon: Grid, label: "Gestión de Stock", href: "/asignar-stock" },
  { icon: Tags, label: "Gestión de Categorías", href: "/crear-categoria" },
  { icon: Package, label: "Gestión de Proveedores", href: "/crear-proveedor" },
  { icon: Box, label: "Entregas Registradas", href: "/registro-entregas" },
  { icon: MapPin, label: "Registrar Visita", href: "/visita" },
  { icon: Star, label: "Registrar Prospecto", href: "/prospecto" },
  { icon: ChartNoAxesCombinedIcon, label: "Gráficas", href: "/analisis" },

  { icon: Sheet, label: "Reportes", href: "/reportes" },

  { icon: LockKeyholeOpen, label: "Recuperar Contraseña", href: "/recovery" },

  { icon: Info, label: "Info Empresa", href: "/empresa-info" },
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

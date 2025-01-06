import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  CheckSquare,
  Map,
  ShoppingCart,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function DashboardEmp() {
  const cards = [
    {
      title: "Hacer Venta",
      description: "Registra una nueva venta para un cliente",
      icon: <ShoppingCart className="h-6 w-6" />,
      to: "/hacer-ventas",
    },
    {
      title: "Clientes",
      description: "Buscar y ver detalles de clientes",
      icon: <Users className="h-6 w-6" />,
      to: "/clientes",
    },
    {
      title: "Check",
      description: "Revisa y actualiza tu registro de entrada/salida",
      icon: <CheckSquare className="h-6 w-6" />,
      to: "/registrar-entrada-salida",
    },
    // {
    //   title: "Añadir Cliente",
    //   description: "Agrega un nuevo cliente a tu base de datos",
    //   icon: <UserPlus className="h-6 w-6" />,
    //   to: "/anadir-cliente",
    // },
    {
      title: "Visita",
      description: "Crea registros de visitas a clientes",
      icon: <Map className="h-6 w-6" />,
      to: "/visita",
    },
    {
      title: "Prospecto",
      description: "Inicia un prospecto con un potencial cliente",
      icon: <Target className="h-6 w-6" />,
      to: "/prospecto",
    },
    {
      title: "Mis Ventas",
      description: "Visualiza y analiza tu historial de ventas",
      icon: <BarChart className="h-6 w-6" />,
      to: "/mis-ventas",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-center text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Link key={index} to={card.to} className="block hover:no-underline">
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardEmp;

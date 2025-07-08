import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  // AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  Coins,
  ThumbsDown,
  TrendingUp,
  User2Icon,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

//
import { BarElement } from "chart.js";

// Registrar componentes necesarios para Chart.js
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

import { useSocket } from "../Context/SocketProvider ";
import { LastSales } from "@/Utils/Types2/LastSales";
import { SalesMonthYear } from "@/Utils/Types2/SalesMonthTotal";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useStore } from "@/Context/ContextSucursal";
const API_URL = import.meta.env.VITE_API_URL;

import { RadialLinearScale, Filler } from "chart.js";

import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
// import { MotionConfig } from "framer-motion";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface connectedUser {
  totalConnectedUsers: number;
  totalEmployees: number;
  totalAdmins: number;
}

interface ConnectedUsersData {
  totalConnectedUsers: number;
  totalEmployees: number;
  totalAdmins: number;
}

interface Cliente {
  id: number;
  nombre: string;
}

interface Vendedor {
  id: number;
  nombre: string;
}

interface SolicitudDescuento {
  id: number;
  porcentaje: number;
  estado: string;
  usuarioId: number;
  clienteId: number;
  creadoEn: string; // Formato ISO string
  justificacion: string;
  cliente: Cliente;
  vendedor: Vendedor;
}

export default function Dashboard() {
  const socket = useSocket();
  const [connectedUsers, setConnectedUsers] = useState<connectedUser>();
  const [discountRequests, setDiscountRequests] = useState<
    SolicitudDescuento[]
  >([]);

  //--------------------------ESTADOS DE FUNCIONES Y USEEFFECT--------------------------------------------
  const [montoMes, setMontoMes] = useState(0);
  const [montoSemana, setMontoSemana] = useState(0);
  const [montoDia, setMontoDia] = useState(0);
  const [cantidadClientes, setCantidadClientes] = useState(0);
  const [lastSales, setLastSales] = useState<LastSales>([]);
  const [salesMonthYear, setSalesMonthYear] = useState<SalesMonthYear[]>([]);

  const [showAcept, setShowAcept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number>(0); // Estado para el ID de la solicitud
  const [porcentaje, setPorcentaje] = useState<number>(0); // Estado para el ID de la solicitud
  const [clienteId, setClienteId] = useState<number>(0); // Estado para el ID de la solicitud
  const [vendedorId, setVendedorId] = useState<number>(0); // Estado para el ID de la solicitud

  //------------DATA PARA EL CHART--------------
  const labels = salesMonthYear.map((data) => data.mes);
  const totalVentasData = salesMonthYear.map((data) => data.totalVentas);
  const ventasTotalesData = salesMonthYear.map((data) => data.ventasTotales);

  const userRol = useStore((state) => state.userRol);
  // const userId = useStore((state) => state.userId) ?? 0;

  const dataChart = {
    labels: labels,
    datasets: [
      {
        label: "Total Ventas",
        data: totalVentasData,
        borderColor: "rgba(255, 99, 132, 1)", // Color rojo
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Transparente del mismo color
        fill: true,
      },
      {
        label: "Número de Ventas",
        data: ventasTotalesData,
        borderColor: "rgba(54, 162, 235, 1)", // Color azul
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Transparente del mismo color
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Esto le dice a TypeScript que el valor es exactamente 'top'
      },
      title: {
        display: true,
        text: "Ventas Mensuales",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          mesResponse,
          semanaResponse,
          diaResponse,
          cantidadcustomers,
          lastSaleResponse,
          salesmonthyearResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/analytics/get-total-month`), //total del mes
          fetch(`${API_URL}/analytics/get-total-weekly`), //total de la semana
          fetch(`${API_URL}/analytics/get-total-day`), //total de hoy
          fetch(`${API_URL}/analytics/get-total-clientes`), //total clientes
          fetch(`${API_URL}/sale/last-sales`), //ultimas ventas
          fetch(`${API_URL}/analytics/get-total-month-monto`), //total ventas por mes del año
        ]);

        const montoMesData = await mesResponse.json();
        const montoSemanaData = await semanaResponse.json();
        const montoDiaData = await diaResponse.json();
        const cantidadClientes = await cantidadcustomers.json();
        const lastS = await lastSaleResponse.json();
        const salesmonthy = await salesmonthyearResponse.json();

        setMontoMes(montoMesData);
        setMontoSemana(montoSemanaData);
        setMontoDia(montoDiaData);
        setCantidadClientes(cantidadClientes);
        setLastSales(lastS);
        setSalesMonthYear(salesmonthy);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (socket && userRol && userRol === "ADMIN") {
      // Escuchar nuevas solicitudes de descuento
      socket.on(
        "newDiscountRequest",
        (solicitudDescuento: SolicitudDescuento) => {
          console.log(
            "Nueva solicitud de descuento recibida:",
            solicitudDescuento
          );
          // Agregar la nueva solicitud de descuento a tu estado
          setDiscountRequests((prevRequests) => [
            ...prevRequests,
            solicitudDescuento,
          ]);
        }
      );

      // Limpiar el evento del socket cuando el componente se desmonte
      return () => {
        socket.off("newDiscountRequest");
      };
    }
  }, [socket]);

  const getRequestsDiscounts = async () => {
    const response = await axios.get(
      `${API_URL}/discount/solicitudes-descuento`
    );
    if (response.status === 200) {
      setDiscountRequests(response.data);
    }
  };
  useEffect(() => {
    const getRequestsDiscounts = async () => {
      const response = await axios.get(
        `${API_URL}/discount/solicitudes-descuento`
      );
      if (response.status === 200) {
        setDiscountRequests(response.data);
      }
    };
    getRequestsDiscounts();
  }, []);

  useEffect(() => {
    if (socket) {
      const updateListener = (data: ConnectedUsersData) => {
        console.log("Usuarios conectados recibidos:", data);
        setConnectedUsers(data);
        console.log("Nueva actualizacion recibida", data);
      };
      // Escuchar el evento
      socket.on("updateConnectedUsers", updateListener);

      // Limpiar la suscripción al desmontar
      return () => {
        socket.off("updateConnectedUsers", updateListener);
      };
    }
  }, [socket]);

  //CREAR EL REGISTRO DE DESCUENTO, LANZAR NOTIFICACION
  const createDiscountFromRequest = async () => {
    console.log("Datos para el descuento:", {
      porcentaje,
      clienteId,
      vendedorId,
      selectedRequestId,
    });

    // Validar que los datos esenciales estén definidos antes de hacer la petición
    if (!porcentaje || !clienteId || !vendedorId || !selectedRequestId) {
      toast.error(
        "Faltan datos para procesar el descuento. Verifica la información."
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/location/create-discount-from-request`,
        {
          porcentaje,
          clienteId,
          vendedorId,
          requestId: selectedRequestId,
        }
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Descuento aplicado correctamente.");
        getRequestsDiscounts(); // Actualizar la lista de descuentos
      } else {
        toast.info("Algo salió mal, recargue la pagina y vuelva a intentar.");
      }
    } catch (error) {
      console.error("Error al procesar el descuento:", error);
      toast.error("No se pudo aplicar el descuento. Intenta nuevamente.");
    } finally {
      setShowAcept(false); // Cerrar el modal u ocultar el formulario
    }
  };

  //ELIMINAR EL REGISTRO DE PETICION DE DESCUENTO, Y NOTIFICAR AL CLIENTE QUE NO SE LE ASIGNÓ
  const rejectDiscountRequest = async () => {
    console.log("Datos para rechazar la solicitud:", {
      vendedorId,
      selectedRequestId,
    });

    // Validar que los datos esenciales estén definidos antes de hacer la petición
    if (!vendedorId || !selectedRequestId) {
      toast.error(
        "Faltan datos para rechazar la solicitud. Verifica la información."
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/location/delete-discount-regist`,
        {
          vendedorId,
          requestId: selectedRequestId,
        }
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          "La solicitud de descuento ha sido rechazada correctamente."
        );
        getRequestsDiscounts(); // Actualizar la lista
      } else {
        toast.info(
          "La solicitud fue procesada, pero no se obtuvo una respuesta esperada."
        );
      }
    } catch (error) {
      console.error("Error al rechazar la solicitud de descuento:", error);
      toast.error("No se pudo rechazar la solicitud. Intenta nuevamente.");
    } finally {
      setShowReject(false); // Cerrar el modal u ocultar el formulario
    }
  };

  console.log("Los usuarios conectados son: ", connectedUsers);

  // Componente principal
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <h1 className="text-3xl font-bold  text-gray-900 dark:text-white">
              Dashboard Caballeros Boutique
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[
            {
              title: "Ingresos del Mes",
              value: `Q${montoMes.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`,
              icon: <Coins className="h-5 w-5 text-green-500" />,
            },
            {
              title: "Ventas de la semana",
              value: `Q${montoSemana.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`,
              icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
            },
            {
              title: "Ventas del día",
              value: `Q${montoDia.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`,
              icon: <Calendar className="h-5 w-5 text-purple-500" />,
            },
            {
              title: "Empleados activos",
              value: connectedUsers?.totalConnectedUsers ?? "Cargando...",
              icon: <User2Icon className="h-5 w-5 text-orange-500" />,
            },
            {
              title: "Clientes",
              value: cantidadClientes ?? "Cargando...",
              icon: <Users className="h-5 w-5 text-pink-500" />,
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 h-full flex flex-col p-4 rounded-lg">
                <CardHeader className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {card.title}
                  </CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Discount Requests Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.5 }} // Ajusta el delay según el orden del card
        >
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle>Solicitudes de Descuento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descuento solicitado</TableHead>
                    <TableHead>Justificación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountRequests && discountRequests.length > 0 ? (
                    discountRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.vendedor.nombre}</TableCell>
                        <TableCell>{request.cliente.nombre}</TableCell>
                        <TableCell>{request.porcentaje}%</TableCell>
                        <TableCell className="max-w-xs truncate whitespace-normal break-words">
                          {request.justificacion
                            ? request.justificacion
                            : "Sin añadir"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedRequestId(Number(request.id));
                              setPorcentaje(request.porcentaje);
                              setClienteId(request.cliente.id);
                              setVendedorId(request.vendedor.id);
                              setShowAcept(true);
                            }}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRequestId(Number(request.id));
                              setVendedorId(request.vendedor.id);
                              setShowReject(true);
                            }}
                          >
                            Rechazar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center font-bold">
                        No hay solicitudes de descuento
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* DIALOG PARA ACEPTAR */}
        <Dialog open={showAcept} onOpenChange={setShowAcept}>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-primary justify-center text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  Confirmar acción
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground mt-2 text-center">
                  Se creará una instancia nueva de descuento para este cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-6 py-6">
                <p className="text-xl font-semibold text-center text-secondary-foreground">
                  ¿Desea continuar?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Button
                    variant="destructive"
                    onClick={() => setShowAcept(false)}
                    type="button"
                    className="w-full text-base font-medium transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="mr-2 h-5 w-5" /> Cancelar
                  </Button>

                  <Button
                    onClick={createDiscountFromRequest}
                    type="button"
                    className="w-full text-base font-medium bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90"
                  >
                    <Check className="mr-2 h-5 w-5" /> Aceptar
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* DIALOG PARA RECHAZAR */}
        <Dialog open={showReject} onOpenChange={setShowReject}>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center">
                <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-primary mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <span>Rechazar Solicitud de Descuento</span>
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground mt-2">
                  Esta acción no se puede deshacer. Por favor, confirme su
                  decisión.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-6 py-6">
                <p className="text-xl font-semibold text-center text-secondary-foreground px-4">
                  ¿Estás seguro de que deseas rechazar esta solicitud?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowReject(false)}
                    type="button"
                    className="w-full text-base font-medium transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <X className="mr-2 h-5 w-5" /> Cancelar
                  </Button>

                  <Button
                    onClick={rejectDiscountRequest}
                    type="button"
                    variant="destructive"
                    className="w-full  text-base font-medium transition-all duration-200 hover:bg-destructive/90"
                  >
                    <ThumbsDown className="mr-2 h-5 w-5" /> Rechazar
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Sales Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.5 }} // Ajusta el delay según el orden del card
        >
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle>Transacciones recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Metodo Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastSales &&
                    lastSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.vendedor.nombre}</TableCell>

                        <TableCell>{sale.cliente.nombre}</TableCell>
                        <TableCell>
                          {sale.productos.reduce(
                            (total, prod) => total + prod.cantidad,
                            0
                          )}
                        </TableCell>
                        <TableCell>
                          Q
                          {sale.montoConDescuento
                            ? sale.montoConDescuento
                            : sale.monto}
                        </TableCell>
                        <TableCell>{formatearFecha(sale.timestamp)}</TableCell>
                        <TableCell>
                          {sale.descuento
                            ? sale.descuento + "%"
                            : "No aplicado"}
                        </TableCell>
                        <TableCell
                          className={`${
                            sale.metodoPago === "CREDITO"
                              ? "text-red-500"
                              : "text-black dark:text-white"
                          }`}
                        >
                          {sale.metodoPago}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Add more rows as needed */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales general per month */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.5 }} // Ajusta el delay según el orden del card
        >
          <Card className="mt-8 shadow-xl h-full">
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex items-center justify-center">
              <Line
                className="w-full h-full"
                data={dataChart}
                options={options}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* VENTAS POR CATEGORÍA */}

        {/* MOSTRAR LOS REGISTROS DE CREDITOS */}
      </main>

      {/* Footer */}
    </div>
  );
}
// export default Dashboard;

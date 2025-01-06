import { useEffect, useState } from "react";
import { Coins, User2Icon } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useStore } from "@/Context/ContextSucursal";
const API_URL = import.meta.env.VITE_API_URL;

import { RadialLinearScale, Filler } from "chart.js";

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

  // const [locations, setLocations] = useState<LocationReceived[]>([]);
  // useEffect(() => {
  //   if (socket) {
  //     const locationListener = (locationData: LocationReceived) => {
  //       console.log("Nueva ubicación recibida:", locationData);

  //       setLocations((prevLocations) => {
  //         const existingLocationIndex = prevLocations.findIndex(
  //           (loc) => loc.usuarioId === locationData.usuarioId
  //         );

  //         if (existingLocationIndex !== -1) {
  //           const updatedLocations = [...prevLocations];
  //           updatedLocations[existingLocationIndex] = locationData;
  //           return updatedLocations;
  //         } else {
  //           return [...prevLocations, locationData];
  //         }
  //       });
  //     };

  //     socket.on("receiveLocation", locationListener);

  //     return () => {
  //       socket.off("receiveLocation", locationListener);
  //     };
  //   }
  // }, [socket]);

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
    console.log("Los datos a usar son: ", porcentaje, clienteId);
    try {
      const response = await axios.post(
        `${API_URL}/location/create-discount-from-request`,
        {
          porcentaje: porcentaje,
          clienteId: clienteId,
          vendedorId: vendedorId,
          requestId: selectedRequestId,
        }
      );

      if (response.status === 200 || response.status == 201) {
        toast.success("Petición acatada, descuento asignado");
        getRequestsDiscounts();
      }

      setShowAcept(false);
    } catch (error) {
      console.error("Error al aceptar la solicitud de descuento:", error);
    }
  };

  //ELIMINAR EL REGISTRO DE PETICION DE DESCUENTO, Y NOTIFICAR AL CLIENTE QUE NO SE LE ASIGNÓ
  const rejectdiscountRequest = async () => {
    console.log("Los datos a usar son: ", porcentaje, clienteId);
    try {
      const response = await axios.post(
        `${API_URL}/location/delete-discount-regist`,
        {
          vendedorId: vendedorId,
          requestId: selectedRequestId,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Petición rechazada");
        getRequestsDiscounts();
        setShowReject(false);
      }
    } catch (error) {
      console.error("Error al aceptar la solicitud de descuento:", error);
    }
  };

  console.log("Los usuarios conectados son: ", connectedUsers);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <h1 className="text-2xl font-bold m-3 text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos del Mes
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Q
                {montoMes.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ventas de la semana
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Q
                {montoSemana.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ventas del día
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Q
                {montoDia.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empleados activos
              </CardTitle>
              <User2Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  connectedUsers === null || connectedUsers === undefined
                    ? "Cargando..." // Mientras se obtienen los datos
                    : connectedUsers.totalConnectedUsers
                    ? connectedUsers.totalConnectedUsers // Mostrar el número cuando existan datos
                    : "Cargando..." // Mostrar este mensaje solo cuando se determine que no tiene permisos
                }
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <User2Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cantidadClientes ? cantidadClientes : "Cargando..."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discount Requests Section */}
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
                  <TableHead>Justificacion</TableHead>

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
                      <TableCell>
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
                            setSelectedRequestId(Number(request.id)); // Actualizar el ID de la solicitud seleccionada
                            setPorcentaje(request.porcentaje);
                            setClienteId(request.cliente.id);
                            setVendedorId(request.vendedor.id);
                            setShowAcept(true); // Abrir el diálogo de aceptación
                          }}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedRequestId(Number(request.id)); // Actualizar el ID de la solicitud seleccionada
                            setVendedorId(request.vendedor.id);
                            setShowReject(true); // Abrir el diálogo de rechazo
                          }}
                        >
                          Rechazar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <h2 className="text-center font-bold justify-center items-center"></h2>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* DIALOG PARA ACEPTAR */}
        <Dialog open={showAcept} onOpenChange={setShowAcept}>
          <DialogHeader></DialogHeader>
          <DialogContent className="p-16">
            <p className="text-lg font-bold text-center">
              Se creará una instancia nueva de descuento para este cliente
            </p>
            <p className="text-lg font-bold text-center">¿Continuar?</p>
            <div className="flex gap-2 justify-center items-center">
              <Button onClick={createDiscountFromRequest} type="button">
                Aceptar
              </Button>
              <Button
                variant={"destructive"}
                onClick={() => setShowAcept(false)}
                type="button"
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* DIALOG PARA RECHAZAR */}
        <Dialog open={showReject} onOpenChange={setShowReject}>
          <DialogHeader>
            {/* <DialogTitle>Rechazar Solicitud de Descuento</DialogTitle> */}
          </DialogHeader>
          <DialogContent className="p-16">
            <p className="text-lg font-bold text-center">
              ¿Estás seguro de que deseas rechazar esta solicitud?
            </p>
            <div className="flex gap-2 justify-center items-center">
              <Button onClick={rejectdiscountRequest} type="button">
                Rechazar
              </Button>
              <Button
                variant={"destructive"}
                onClick={() => setShowReject(false)}
                type="button"
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sales Section */}
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle>Últimas ventas</CardTitle>
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
                      <TableCell>
                        {new Date(sale.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sale.descuento ? sale.descuento + "%" : "No aplicado"}
                      </TableCell>
                      <TableCell>{sale.metodoPago}</TableCell>
                    </TableRow>
                  ))}

                {/* Add more rows as needed */}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Sales general per month */}
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
        {/* VENTAS POR CATEGORÍA */}
      </main>

      {/* Footer */}
    </div>
  );
}
// export default Dashboard;

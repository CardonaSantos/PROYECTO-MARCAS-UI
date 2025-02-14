import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  DeleteIcon,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Percent,
  Phone,
  Search,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import axios from "axios";
import { useStore } from "@/Context/ContextSucursal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import DatePicker from "react-datepicker";

const API_URL = import.meta.env.VITE_API_URL;

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

//TIPOS PARA LOS REGISTROS DE CREDITOS
// Tipos
type ClienteCredito = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
};

type VendedorCredito = {
  id: number;
  nombre: string;
  correo: string;
};

type VentaCredito = {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number | null;
  metodoPago: string;
  timestamp: string;
  vendedor: VendedorCredito;
};

type Credito = {
  id: number;
  ventaId: number;
  clienteId: number;
  empresaId: number;
  montoTotal: number;
  cuotaInicial: number;
  totalPagado: number;
  numeroCuotas: number;
  estado: string;
  interes: number;
  montoConInteres: number;
  montoTotalConInteres: number;
  saldoPendiente: number;
  fechaInicio: string;
  fechaContrato: string;
  dpi: string;
  testigos: Record<string, unknown>;
  comentario: string;
  createdAt: string;
  updatedAt: string;
  cliente: ClienteCredito;
  pagos: PagoCredito[];
  venta: VentaCredito;
};

type PagoCredito = {
  id: number;
  creditoId: number;
  monto: number;
  timestamp: string;
  metodoPago: string;
};

type MetodoPago = "CONTADO" | "TARJETA" | "TRANSFERENCIA";

interface nuevoPago {
  creditoId: number | undefined;
  monto: number | undefined;
  metodoPago: MetodoPago;
  ventaId: number | undefined;
}

function Creditos() {
  const userId = useStore((state) => state.userId) ?? 0;
  const empresaId = useStore((state) => state.sucursalId) ?? 0;
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [passwordToDeletePayment, setPasswordToDeletePayment] = useState("");
  const [openDeletePayment, setOpenDeletePayment] = useState(false);
  const [pagoId, setPagoId] = useState(0);
  const [selectedCredit, setSelectedCredit] = useState<Credito | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState<nuevoPago>({
    creditoId: selectedCredit?.id,
    monto: 0,
    metodoPago: "CONTADO",
    ventaId: 0,
  });
  const [openDeletCredit, setOpenDeletCredit] = useState(false);
  const [adminPassword, setAdminPasssword] = useState("");
  const [creditIdToDelete, setCreditIdToDelete] = useState(0);

  const getCreditos = async () => {
    try {
      const response = await axios.get(`${API_URL}/credito`);
      if (response.status === 200) {
        setCreditos(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al conseguir creditos");
    }
  };

  useEffect(() => {
    getCreditos();
  }, []);
  // Función para abrir el diálogo de detalles
  const openDetailDialog = (credito: Credito) => {
    setSelectedCredit(credito);
    setIsDetailOpen(true);
  };
  // Función para abrir el diálogo de pago
  const openPaymentDialog = () => {
    if (selectedCredit) {
      setNewPayment({
        creditoId: selectedCredit.id,
        monto: 0,
        metodoPago: "CONTADO",
        ventaId: selectedCredit.ventaId,
      });
      setIsDetailOpen(false);

      setIsPaymentOpen(true);
    }
  };

  // Función para manejar el registro de pago
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para registrar el pago en el backend
    console.log("Nuevo pago:", newPayment);
    // setIsPaymentOpen(false);

    if (
      !empresaId ||
      !newPayment.monto ||
      newPayment.monto <= 0 ||
      !newPayment.metodoPago
    ) {
      toast.info("Faltan datos para el registro, intente de nuevo");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/credito/regist-payment`, {
        empresaId: empresaId,
        monto: newPayment.monto,
        metodoPago: newPayment.metodoPago,
        creditoId: newPayment.creditoId,
        ventaId: newPayment.ventaId,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Pago registrado");
        getCreditos();
        setIsPaymentOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al registrar pago");
    }
  };

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(cantidad);
  };

  const handleDeleteCredit = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/credito/delete-credito-regist`,
        {
          creditoId: Number(creditIdToDelete),
          userId: userId,
          adminPassword: adminPassword.trim(),
          empresaId: empresaId,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Registro de credito eliminado");
        setOpenDeletCredit(false);
        setAdminPasssword("");
        getCreditos();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al registrar eliminación");
    }
  };

  const handleDeletePaymentRegist = async () => {
    try {
      if (!userId || !passwordToDeletePayment || !pagoId || !empresaId) {
        toast.info("Faltand datos, intente de nuevo");
        return;
      }

      const response = await axios.post(
        `${API_URL}/credito/delete-payment-regist`,
        {
          userId: userId,
          password: passwordToDeletePayment,
          creditoId: pagoId,
          empresaId: empresaId,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Pago eliminado correctamente");
        setOpenDeletePayment(false);
        setPasswordToDeletePayment("");
        setIsDetailOpen(false);
        setSelectedCredit(null);
        getCreditos();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al eliminar pago");
    }
  };
  //===============>
  console.log("Los creditos del recurso son: ", creditos);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [filtroVenta, setFiltroVenta] = useState("");

  const ventasFiltradas = creditos?.filter((venta) => {
    const filtroNormalizado = filtroVenta.trim().toLocaleLowerCase();
    const nombreCompleto = `${venta.cliente.nombre || ""} ${
      venta.cliente.apellido || ""
    }`
      .trim()
      .toLocaleLowerCase();

    const cumpleTexto =
      nombreCompleto.includes(filtroNormalizado) ||
      venta.cliente.telefono?.toLocaleLowerCase().includes(filtroNormalizado) ||
      //   venta.cliente.correo?.toLocaleLowerCase().includes(filtroNormalizado) ||
      venta.cliente.direccion
        ?.toLocaleLowerCase()
        .includes(filtroNormalizado) ||
      venta.id.toString().includes(filtroNormalizado);

    const cumpleFechas =
      (!startDate || new Date(venta.fechaContrato) >= startDate) &&
      (!endDate || new Date(venta.fechaContrato) <= endDate);

    return cumpleTexto && cumpleFechas;
  });

  // PAGINACIÓN
  const totalPages = Math.ceil((ventasFiltradas?.length || 0) / itemsPerPage);
  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    ventasFiltradas && ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        <Card className="shadow-xl">
          <CardContent>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-gray-400 w-7 h-7" />
                <h1 className="text-2xl font-bold">Gestión de Créditos</h1>
              </div>
            </CardHeader>
            <div className="bg-muted p-4 rounded-lg mb-4 shadow-lg">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="search-sales"
                    type="search"
                    placeholder="Buscar ventas..."
                    value={filtroVenta}
                    onChange={(e) => setFiltroVenta(e.target.value)}
                    className="w-full pl-10"
                    aria-label="Buscar ventas"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <DatePicker
                    locale="es"
                    selected={startDate || undefined} // Convierte null a undefined
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    placeholderText="Fecha inicio"
                    isClearable
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <DatePicker
                    locale="es"
                    isClearable
                    selected={endDate || undefined} // Convierte null a undefined
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    minDate={startDate || undefined}
                    placeholderText="Fecha fin"
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto Total</TableHead>
                  <TableHead>Saldo Pagado</TableHead>

                  <TableHead>Saldo Pendiente</TableHead>
                  <TableHead>Fecha de Registro</TableHead>

                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                  <TableHead>Eliminar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems &&
                  currentItems.map((credito) => (
                    <TableRow key={credito.id}>
                      <TableCell>{credito.id}</TableCell>
                      <TableCell>{`${credito.cliente.nombre} ${credito.cliente.apellido}`}</TableCell>
                      <TableCell>
                        {formatearMoneda(credito.montoTotalConInteres)}
                      </TableCell>
                      <TableCell>
                        {formatearMoneda(credito.totalPagado)}
                      </TableCell>

                      <TableCell>
                        {formatearMoneda(credito.saldoPendiente)}
                      </TableCell>
                      <TableCell>
                        {formatearFecha(credito.fechaContrato)}
                      </TableCell>

                      <TableCell>{credito.estado}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDetailDialog(credito)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setOpenDeletCredit(true);
                            setCreditIdToDelete(credito.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <CardFooter className="flex items-center justify-center py-4">
              <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        variant={currentPage === 1 ? "outline" : "default"}
                      >
                        Primera
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          onPageChange(Math.max(1, currentPage - 1))
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </PaginationPrevious>
                    </PaginationItem>

                    {/* Sistema de truncado */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => onPageChange(1)}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-muted-foreground">...</span>
                        </PaginationItem>
                      </>
                    )}

                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      if (
                        page === currentPage ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => onPageChange(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    {currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <span className="text-muted-foreground">...</span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => onPageChange(totalPages)}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </PaginationNext>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        // variant={"destructive"}
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        variant={
                          currentPage === totalPages ? "outline" : "destructive"
                        }
                      >
                        Última
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardFooter>
          </CardContent>
        </Card>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent
            className="
    sm:max-w-[425px] sm:max-h-[75vh] 
    md:max-w-[600px] md:max-h-[65vh] 
    lg:max-w-[700px] lg:max-h-[97vh] 
    max-h-[90vh] w-full
    overflow-auto
  "
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Detalles del Crédito
              </DialogTitle>
            </DialogHeader>
            {selectedCredit && (
              <div className="">
                {/* LA PARTE DE ARRIBA */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-2">
                        <h3 className="font-semibold text-sm mb-2 flex items-center">
                          <User className="mr-2 w-4 h-4" />
                          Cliente
                        </h3>
                        <p className="text-sm">
                          {selectedCredit.cliente.nombre}{" "}
                          {selectedCredit.cliente.apellido}
                        </p>
                      </div>

                      <div className="mb-2">
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          <Phone className="mr-2 w-4 h-4" /> Teléfono
                        </h3>
                        <p className="text-sm">
                          {selectedCredit.cliente.telefono}
                        </p>
                      </div>

                      <div className="mb-2">
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          <MapPin className="mr-2 w-4 h-4" /> Dirección
                        </h3>
                        <p className="text-sm">
                          {selectedCredit.cliente.direccion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Coins className="mr-2" /> Información Financiera
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm flex justify-between">
                          <span>Monto Total:</span>
                          <Badge variant="secondary">
                            {formatearMoneda(
                              selectedCredit.montoTotalConInteres
                            )}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Saldo Pagado:</span>
                          <Badge variant="secondary">
                            {formatearMoneda(selectedCredit.totalPagado)}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Saldo Pendiente:</span>
                          <Badge variant="destructive">
                            {formatearMoneda(selectedCredit.saldoPendiente)}
                          </Badge>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="my-4" />
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="font-medium">Fecha de Inicio:</span>{" "}
                      {new Date(
                        selectedCredit.fechaInicio
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="font-medium">Cuotas:</span>{" "}
                      {selectedCredit.pagos.length} de{" "}
                      {selectedCredit.numeroCuotas}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="font-medium">Interés:</span>{" "}
                      {selectedCredit.interes}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="font-medium">Cuota Inicial:</span>{" "}
                      {formatearMoneda(selectedCredit.cuotaInicial)}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />
                <div className="space-y-2 mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MessageSquare className="mr-2 w-4 h-4" /> Comentario
                  </h3>
                  <p className="text-sm">
                    {selectedCredit.comentario || "Sin comentarios"}
                  </p>
                </div>

                <div className="w-full overflow-x-auto ">
                  <Table>
                    <TableCaption>
                      Una lista de los pagos recibidos
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">No.</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Metodo</TableHead>
                        <TableHead className="text-right">Fecha</TableHead>

                        <TableHead>Comprobante</TableHead>

                        <TableHead>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCredit.pagos.map((credit) => (
                        <TableRow>
                          <TableCell className="font-medium">
                            {credit.id}
                          </TableCell>
                          <TableCell>{formatearMoneda(credit.monto)}</TableCell>
                          <TableCell>{credit.metodoPago}</TableCell>
                          <TableCell className="text-[13px]">
                            {formatearFecha(credit.timestamp)}
                          </TableCell>

                          <TableCell className="flex justify-center items-center">
                            <Link to={`/comprobante-pago/${credit.id}`}>
                              <Button type="button" variant={"ghost"}>
                                <FileText />
                              </Button>
                            </Link>
                          </TableCell>

                          {/* AJUSTAR LA VISTA PARA CERRAR EL DIALOG AL ELIMINAR EL PAGO O ACTUALIZAR EL DIALOG */}
                          <TableCell>
                            <Button
                              onClick={() => {
                                setOpenDeletePayment(true);
                                setPagoId(credit.id);
                              }}
                              type="button"
                              variant={"ghost"}
                            >
                              <DeleteIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex justify-end">
                  {/* FUNCION PARA CREAR PAGO */}
                  <Button onClick={openPaymentDialog}>
                    <Coins className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openDeletCredit} onOpenChange={setOpenDeletCredit}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Eliminar registro de crédito
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              <div className="text-center text-gray-600">
                <p>
                  Esta acción es irreversible. Por favor, confirme su autoridad
                  para proceder.
                </p>
              </div>
              <Input
                placeholder="Ingrese su contraseña de administrador"
                value={adminPassword}
                onChange={(e) => setAdminPasssword(e.target.value)}
                type="password"
                className="w-full"
              />
            </div>
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenDeletCredit(false)}
                className="w-full sm:w-1/2"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCredit}
                className="w-full sm:w-1/2"
              >
                Confirmar y eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openDeletePayment} onOpenChange={setOpenDeletePayment}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-center">
                Eliminar registro de pago
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-center">
                  ¿Estás seguro de querer eliminar el pago registrado?
                </h3>
              </div>
              <Input
                value={passwordToDeletePayment}
                onChange={(e) => setPasswordToDeletePayment(e.target.value)}
                placeholder="Ingrese su contraseña de administrador"
                type="password"
                className="w-full"
              />
            </div>
            <DialogFooter className="mt-6 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => setOpenDeletePayment(false)}
                className="w-full my-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePaymentRegist}
                className="w-full my-1"
              >
                Eliminar pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center">
                <Coins className="mr-2" />
                Registrar Pago
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="monto" className="text-sm font-medium">
                        Monto
                      </Label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          id="monto"
                          type="number"
                          value={newPayment.monto}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              monto: parseFloat(e.target.value),
                            })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="metodoPago"
                        className="text-sm font-medium"
                      >
                        Método de Pago
                      </Label>
                      <Select
                        value={newPayment.metodoPago}
                        onValueChange={(value: MetodoPago) =>
                          setNewPayment({ ...newPayment, metodoPago: value })
                        }
                      >
                        <SelectTrigger id="metodoPago" className="w-full">
                          <SelectValue placeholder="Seleccione el método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONTADO">
                            <span className="flex items-center">
                              <Coins className="mr-2 h-4 w-4" />
                              CONTADO
                            </span>
                          </SelectItem>
                          <SelectItem value="TARJETA">
                            <span className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              TARJETA
                            </span>
                          </SelectItem>
                          <SelectItem value="TRANSFERENCIA_BANCO">
                            <span className="flex items-center">
                              <Banknote className="mr-2 h-4 w-4" />
                              TRANSFERENCIA
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                type="button"
                onClick={handlePaymentSubmit}
                className="w-full"
              >
                Registrar Pago
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PAGINACION */}
    </div>
  );
}

export default Creditos;

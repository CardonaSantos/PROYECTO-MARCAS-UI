"use client";

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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  Eye,
  MapPin,
  Phone,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

export type EstadoCredito = "ACTIVO" | "CERRADO";
export type MetodoPago =
  | "CONTADO"
  | "TARJETA"
  | "TRANSFERENCIA_BANCO"
  | "CREDITO";

export interface CreditoCliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
}

export interface CreditoVendedor {
  id: number;
  nombre: string;
  correo: string;
}

export interface CreditoVenta {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: MetodoPago;
  timestamp: string; // ISO
  vendedor: CreditoVendedor;
}

export interface CreditoItem {
  id: number;
  ventaId: number;
  clienteId: number;
  empresaId: number;

  montoTotal: number;
  montoTotalConInteres: number;
  totalPagado: number;
  saldoPendiente: number;
  estado: EstadoCredito;

  fechaInicio: string; // ISO
  fechaFin: string; // ISO
  fechaContrato: string; // ISO

  createdAt: string; // ISO
  updatedAt: string; // ISO

  comentario?: string;

  cliente: CreditoCliente;
  venta: CreditoVenta;
}

export type CreditoArray = CreditoItem[];

function Creditos() {
  const userId = useStore((state) => state.userId) ?? 0;
  const empresaId = useStore((state) => state.sucursalId) ?? 0;

  const [creditos, setCreditos] = useState<CreditoItem[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<CreditoItem | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [openDeleteCredit, setOpenDeleteCredit] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
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

  const openDetailDialog = (credito: CreditoItem) => {
    setSelectedCredit(credito);
    setIsDetailOpen(true);
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
        setOpenDeleteCredit(false);
        setAdminPassword("");
        getCreditos();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al registrar eliminación");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filtroVenta, setFiltroVenta] = useState("");

  const ventasFiltradas = creditos?.filter((credito) => {
    const filtroNormalizado = filtroVenta.trim().toLocaleLowerCase();
    const nombreCompleto = `${credito.cliente.nombre || ""} ${
      credito.cliente.apellido || ""
    }`
      .trim()
      .toLocaleLowerCase();

    const cumpleTexto =
      nombreCompleto.includes(filtroNormalizado) ||
      credito.cliente.telefono
        ?.toLocaleLowerCase()
        .includes(filtroNormalizado) ||
      credito.cliente.direccion
        ?.toLocaleLowerCase()
        .includes(filtroNormalizado) ||
      credito.id.toString().includes(filtroNormalizado);

    const cumpleFechas =
      (!startDate || new Date(credito.fechaContrato) >= startDate) &&
      (!endDate || new Date(credito.fechaContrato) <= endDate);

    return cumpleTexto && cumpleFechas;
  });

  // PAGINACIÓN
  const totalPages = Math.ceil((ventasFiltradas?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    ventasFiltradas && ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

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
                    placeholder="Buscar créditos..."
                    value={filtroVenta}
                    onChange={(e) => setFiltroVenta(e.target.value)}
                    className="w-full pl-10"
                    aria-label="Buscar créditos"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <DatePicker
                    locale="es"
                    selected={startDate || undefined}
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
                    selected={endDate || undefined}
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
                  <TableHead>Monto con descuento</TableHead>
                  <TableHead>Fecha de Contrato</TableHead>
                  {/* <TableHead>Estado</TableHead> */}
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
                        {formatearMoneda(credito.venta.monto)}
                      </TableCell>

                      <TableCell>
                        {formatearMoneda(credito.montoTotal)}
                      </TableCell>
                      <TableCell>
                        {formatearFecha(credito.fechaContrato)}
                      </TableCell>
                      {/* <TableCell>
                        <Badge
                          variant={
                            credito.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {credito.estado}
                        </Badge>
                      </TableCell> */}
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
                            setOpenDeleteCredit(true);
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
          <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Detalles del Crédito
              </DialogTitle>
            </DialogHeader>
            {selectedCredit && (
              <div className="space-y-6">
                {/* Cliente y información financiera */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-sm mb-2 flex items-center">
                            <User className="mr-2 w-4 h-4" />
                            Cliente
                          </h3>
                          <p className="text-sm">
                            {selectedCredit.cliente.nombre}{" "}
                            {selectedCredit.cliente.apellido}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <Phone className="mr-2 w-4 h-4" /> Teléfono
                          </h3>
                          <p className="text-sm">
                            {selectedCredit.cliente.telefono}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <MapPin className="mr-2 w-4 h-4" /> Dirección
                          </h3>
                          <p className="text-sm">
                            {selectedCredit.cliente.direccion}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Coins className="mr-2" /> Información Financiera
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm flex justify-between">
                          <span>Monto Total:</span>
                          <Badge variant="secondary">
                            {formatearMoneda(selectedCredit.montoTotal)}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Total con Interés:</span>
                          <Badge variant="secondary">
                            {formatearMoneda(
                              selectedCredit.montoTotalConInteres
                            )}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Saldo Pagado:</span>
                          <Badge variant="default">
                            {formatearMoneda(selectedCredit.totalPagado)}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Saldo Pendiente:</span>
                          <Badge variant="destructive">
                            {formatearMoneda(selectedCredit.saldoPendiente)}
                          </Badge>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Estado:</span>
                          <Badge
                            variant={
                              selectedCredit.estado === "ACTIVO"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedCredit.estado}
                          </Badge>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Información de fechas y venta */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="mr-2" /> Fechas del Crédito
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <span className="font-medium">
                              Fecha de Contrato:
                            </span>{" "}
                            {formatearFecha(selectedCredit.fechaContrato)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <span className="font-medium">
                              Fecha de Inicio:
                            </span>{" "}
                            {formatearFecha(selectedCredit.fechaInicio)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <span className="font-medium">Fecha de Fin:</span>{" "}
                            {formatearFecha(selectedCredit.fechaFin)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CreditCard className="mr-2" /> Información de Venta
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm">
                          <span className="font-medium">ID Venta:</span>{" "}
                          {selectedCredit.venta.id}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Monto Original:</span>{" "}
                          {formatearMoneda(selectedCredit.venta.monto)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Descuento:</span>{" "}
                          {selectedCredit.venta.descuento}%
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Método de Pago:</span>{" "}
                          {selectedCredit.venta.metodoPago}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Vendedor:</span>{" "}
                          {selectedCredit.venta.vendedor.nombre}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedCredit.comentario && (
                  <>
                    <Separator />
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <AlertTriangle className="mr-2" /> Comentarios
                        </h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm leading-relaxed">
                            {selectedCredit.comentario}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openDeleteCredit} onOpenChange={setOpenDeleteCredit}>
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
                onChange={(e) => setAdminPassword(e.target.value)}
                type="password"
                className="w-full"
              />
            </div>
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteCredit(false)}
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
      </div>
    </div>
  );
}

export default Creditos;

const API_URL = import.meta.env.VITE_API_URL;
//////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import { MetodoPago, SalesType, SaleTypeOne } from "../Utils/Types/Sales";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  Eye,
  FileSpreadsheet,
  Package,
  Search,
  User,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { DialogDescription } from "@radix-ui/react-dialog";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "@/Context/ContextSucursal";

import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

export enum MetodoPagoII {
  CREDITO = "CREDITO",
  CONTADO = "CONTADO",
  TARJETA = "TARJETA",
  TRANSFERENCIA_BANCO = "TRANSFERENCIA_BANCO",
}

interface SalesTypeProp {
  sales: SalesType | null;
}

type Departamento = {
  id: number;
  nombre: string;
};

function Sales() {
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const [sales, setSales] = useState<SalesType | null>(null);

  const getSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sale`);
      if (response.status === 200) {
        setSales(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No hay ventas disponibles para ver");
    }
  };

  useEffect(() => {
    getSales();
  }, []);

  console.log(sales);

  if (!sales || sales.length <= 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-center">
          No hay ventas disponibles
        </h2>
      </div>
    );
  }

  const TableSale: React.FC<SalesTypeProp> = ({ sales }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const userId = useStore((state) => state.userId) ?? 0;

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    console.log(departamentos);

    const getDepartamentos = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/customer-location/get-departamentos`
        );
        if (response.status === 200) {
          setDepartamentos(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.info("No hay municipios");
      }
    };

    useEffect(() => {
      getDepartamentos();
    }, []);

    const [filtroVenta, setFiltroVenta] = useState("");

    // Filtrar ventas por texto y fechas
    const ventasFiltradas = sales?.filter((venta) => {
      const filtroNormalizado = filtroVenta.trim().toLocaleLowerCase();
      const nombreCompleto = `${venta.cliente.nombre || ""} ${
        venta.cliente.apellido || ""
      }`
        .trim()
        .toLocaleLowerCase();

      const cumpleTexto =
        nombreCompleto.includes(filtroNormalizado) ||
        venta.cliente.telefono
          ?.toLocaleLowerCase()
          .includes(filtroNormalizado) ||
        venta.cliente.correo?.toLocaleLowerCase().includes(filtroNormalizado) ||
        venta.cliente.direccion
          ?.toLocaleLowerCase()
          .includes(filtroNormalizado) ||
        venta.id.toString().includes(filtroNormalizado);

      const cumpleFechas =
        (!startDate || new Date(venta.timestamp) >= startDate) &&
        (!endDate || new Date(venta.timestamp) <= endDate);

      return cumpleTexto && cumpleFechas;
    });

    const ventasTotales = sales?.length;

    const [selectedVenta, setSelectedVenta] = useState<SaleTypeOne | null>(
      null
    ); // Estado para manejar la venta seleccionada
    const [isProductsOpen, setIsProductsOpen] = useState(true);
    console.log("Las ventas son: ", sales);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    // PAGINACIÓN
    const totalPages = Math.ceil((ventasFiltradas?.length || 0) / itemsPerPage);
    // Calcular el índice del último elemento de la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    // Calcular el índice del primer elemento de la página actual
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Obtener los elementos de la página actual
    const currentItems =
      ventasFiltradas &&
      ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
    // Cambiar de página
    const onPageChange = (page: number) => {
      setCurrentPage(page);
    };

    //

    //

    // Simulación de solicitud de eliminación de venta
    async function deleteVentaById(
      ventaId: number,
      adminPassword: string,
      userId: number
    ): Promise<void> {
      try {
        const response = await axios.delete(
          `${API_URL}/sale/remove-sale/${ventaId}`,
          {
            data: {
              userId,
              adminPassword,
              sucursalId,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Venta eliminada correctamente");
          getSales();
          return; // Operación exitosa
        } else {
          toast.error("Error al eliminar");

          throw new Error(
            response.data.message || "Error desconocido al eliminar la venta"
          );
        }
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || "Error al conectar con el servidor"
        );
      }
    }

    // const [ventasList, setVentasList] = useState<SalesType|null>(sales);
    const [ventasList, setVentasList] = useState<SalesType>(sales || []);
    console.log(ventasList);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);
    const [adminPassword, setAdminPassword] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>("");

    const openDeleteDialog = (ventaId: number) => {
      setSelectedVentaId(ventaId);
      setIsDialogOpen(true);
    };

    const closeDeleteDialog = () => {
      setIsDialogOpen(false);
      setSelectedVentaId(null);
      setAdminPassword("");
      setDeleteError("");
    };

    const handleDeleteVenta = async () => {
      if (!selectedVentaId) return;

      setIsDeleting(true);
      try {
        await deleteVentaById(selectedVentaId, adminPassword, userId);
        setVentasList((prevVentas) =>
          prevVentas.filter((venta) => venta.id !== selectedVentaId)
        );
        closeDeleteDialog();
      } catch (error: any) {
        setDeleteError(error.message || "Error al eliminar la venta.");
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div className="container mx-auto py-1">
        <Card className="shadow-xl">
          <CardHeader></CardHeader>
          <CardContent>
            <h1 className="text-2xl font-bold mb-5 text-center">
              Historial de Ventas
            </h1>
            <div className="bg-muted p-4 rounded-lg mb-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-semibold flex items-center">
                  <Coins className="mr-2" size={24} />
                  <span>Total ventas: {ventasTotales}</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {currentItems?.length} resultados
                </Badge>
              </div>

              {/* Filtros */}
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

            <div className="grid gap-6 md:grid-cols-1 ">
              <Table>
                <TableCaption>Registros de ventas</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Número Venta</TableHead>
                    <TableHead className="text-center">
                      <Calendar className="inline mr-2" size={16} />
                      Fecha Venta
                    </TableHead>
                    <TableHead className="text-left">
                      <User className="inline mr-2" size={16} />
                      Cliente
                    </TableHead>
                    <TableHead className="text-right">
                      <Coins className="inline mr-2" size={16} />
                      Total con descuento
                    </TableHead>
                    <TableHead className="text-center">
                      <Package className="inline mr-2" size={16} />
                      Productos Vendidos
                    </TableHead>
                    <TableHead className="text-left">Vendedor</TableHead>
                    <TableHead className="text-left">Método Pago</TableHead>

                    <TableHead className="text-center">Ver</TableHead>
                    <TableHead className="text-center">
                      Imprimir Comprobante
                    </TableHead>
                    <TableHead className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems &&
                    currentItems.map((venta) => (
                      <TableRow
                        key={venta.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-center">
                          #{venta.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(venta.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {venta.cliente.apellido
                            ? venta.cliente.nombre +
                              " " +
                              venta.cliente.apellido
                            : venta.cliente.nombre}
                        </TableCell>
                        <TableCell className="text-right">
                          Q{venta.montoConDescuento.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {venta.productos.reduce(
                            (total, producto) => total + producto.cantidad,
                            0
                          )}
                        </TableCell>
                        <TableCell>{venta.vendedor.nombre}</TableCell>
                        <TableCell
                          className={`font-semibold ${
                            venta.metodoPago == MetodoPago.CREDITO
                              ? "text-red-500"
                              : venta.metodoPago == MetodoPago.CONTADO
                              ? "text-green-500"
                              : "text-black"
                          }`}
                        >
                          {venta.metodoPago}
                        </TableCell>

                        <TableCell className="text-center">
                          {/* Trigger del dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedVenta(venta)}
                              >
                                <Eye />
                              </Button>
                            </DialogTrigger>

                            {selectedVenta && selectedVenta.id === venta.id && (
                              <DialogContent className="sm:max-w-[650px] w-11/12 max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold mb-4">
                                    Detalles de la Venta #{selectedVenta.id}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Información detallada de la venta realizada
                                    el {formatearFecha(selectedVenta.timestamp)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <Card>
                                    <CardContent className="pt-6">
                                      <h3 className="font-semibold text-lg mb-2">
                                        Información General
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Cliente
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.cliente.apellido
                                              ? selectedVenta.cliente.nombre +
                                                " " +
                                                selectedVenta.cliente.apellido
                                              : selectedVenta.cliente.nombre}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedVenta.cliente.correo}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedVenta.cliente.telefono}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Vendedor
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.vendedor.nombre}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Método de pago
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.metodoPago}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Descuento
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.descuento
                                              ? `${selectedVenta.descuento}%`
                                              : "No se aplicó"}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Total monto
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.monto
                                              ? `Q${selectedVenta.monto}`
                                              : "No se aplicó"}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            Total monto con descuento
                                          </h4>
                                          <p className="text-sm">
                                            {selectedVenta.montoConDescuento
                                              ? `Q${selectedVenta.montoConDescuento}`
                                              : "No se aplicó"}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardContent className="pt-6">
                                      <Collapsible
                                        open={isProductsOpen}
                                        onOpenChange={setIsProductsOpen}
                                      >
                                        <CollapsibleTrigger asChild>
                                          <div className="flex justify-between items-center cursor-pointer">
                                            <h3 className="font-semibold text-lg">
                                              Productos
                                            </h3>
                                            {isProductsOpen ? (
                                              <ChevronUp className="h-4 w-4" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4" />
                                            )}
                                          </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <ScrollArea className="h-[200px] mt-2">
                                            <ul className="space-y-2">
                                              {selectedVenta.productos.map(
                                                (producto, index) => (
                                                  <li
                                                    key={index}
                                                    className="text-sm"
                                                  >
                                                    <div className="flex justify-between items-start">
                                                      <div>
                                                        <span className="font-medium">
                                                          {
                                                            producto.producto
                                                              .nombre
                                                          }
                                                        </span>
                                                        <br />
                                                        {producto.cantidad}{" "}
                                                        unidades a Q
                                                        {producto.precio.toFixed(
                                                          2
                                                        )}
                                                      </div>
                                                      <span className="text-muted-foreground">
                                                        Q
                                                        {(
                                                          producto.cantidad *
                                                          producto.precio
                                                        ).toFixed(2)}
                                                      </span>
                                                    </div>
                                                    {index <
                                                      selectedVenta.productos
                                                        .length -
                                                        1 && (
                                                      <Separator className="my-2" />
                                                    )}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </ScrollArea>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </CardContent>
                                  </Card>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link to={`/comprobante-venta/${venta.id}`}>
                            <Button variant="outline">
                              <FileSpreadsheet className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                        {/* ABRIR EL DIALOG DE BORRADO */}
                        <TableCell className="text-center">
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => openDeleteDialog(venta.id)}
                              >
                                Eliminar
                              </Button>
                            </DialogTrigger>
                            {selectedVentaId === venta.id && (
                              <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                  <DialogTitle>Eliminar Venta</DialogTitle>
                                  <DialogDescription>
                                    Ingresa la contraseña del administrador para
                                    confirmar
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    type="password"
                                    placeholder="Contraseña del administrador"
                                    value={adminPassword}
                                    onChange={(e) =>
                                      setAdminPassword(e.target.value)
                                    }
                                    className="w-full"
                                  />
                                  {deleteError && (
                                    <p className="text-red-500 text-sm">
                                      {deleteError}
                                    </p>
                                  )}
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      onClick={closeDeleteDialog}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleDeleteVenta}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting
                                        ? "Eliminando..."
                                        : "Confirmar"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-center">
            <div className="flex items-center justify-center py-4">
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
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
        </Card>
      </div>
    );
  };

  return (
    <>
      <TableSale sales={sales} />
    </>
  );
}

export default Sales;

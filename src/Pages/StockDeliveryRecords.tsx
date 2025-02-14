import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Box,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  Eye,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/Context/ContextSucursal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

interface Product {
  id: number;
  productoId: number;
  entregaStockId: number;
  cantidad: number;
  costoUnitario: number;
  producto: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    codigoProducto: string;
    creadoEn: string;
    actualizadoEn: string;
  };
}

interface Delivery {
  id: number;
  proveedorId: number;
  timestamp: string;
  creadoEn: string;
  actualizadoEn: string;
  total_pagado: number;
  productos: Product[];
  proveedor: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    direccion: string;
    creadoEn: string;
    actualizadoEn: string;
  };
}

export default function StockDeliveryRecords() {
  const userId = useStore((state) => state.userId) ?? 0;
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // VERIFICAR LA ELIMINACION DE STOCK, LAS IMAGENES, LOS PROSPECTOS CANCELADOS, EL PROTECTOR DE URL, Y MEJORAR PEQUEÑAS COSAS
  const getDeliveryRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/delivery-stock`);
      if (response.status === 200) {
        setDeliveries(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("No se encontraron registros...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDeliveryRecords();
  }, []);

  const [openDeleteRegist, setOpenDeleteRegist] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState("");
  const [registID, setRegistID] = useState(0);
  const handleDeleteRegist = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/delivery-stock/delete-regist/${registID}`,
        {
          data: { password: passwordAdmin, userId },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Registro de entrega de stock eliminado");
        setOpenDeleteRegist(false);
        setPasswordAdmin("");
        setRegistID(0);
        getDeliveryRecords();
      }
    } catch (error) {
      toast.error("Error al eliminar el registro");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // PAGINACIÓN
  const totalPages = Math.ceil((deliveries?.length || 0) / itemsPerPage);
  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    deliveries && deliveries.slice(indexOfFirstItem, indexOfLastItem);
  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
        Registro de Entregas de Stock
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-6 w-6" />
            Entregas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total Pagado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                <TableHead className="text-right">Eliminar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>
                    {delivery?.proveedor ? (
                      delivery.proveedor.nombre
                    ) : (
                      <Badge>Proveedor eliminado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatearFecha(delivery.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Coins className="mr-2 h-4 w-4" />
                      {new Intl.NumberFormat("es-GT", {
                        style: "currency",
                        currency: "GTQ",
                      }).format(delivery.total_pagado)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeliveryDetailsDialog delivery={delivery} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        setOpenDeleteRegist(true);
                        setRegistID(delivery.id);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <CardFooter className="flex justify-center py-4">
            <Pagination aria-label="Navegación de páginas de productos">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    onClick={() => onPageChange(1)}
                    aria-label="Ir a la primera página"
                  >
                    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  />
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
                          aria-current={
                            page === currentPage ? "page" : undefined
                          }
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
                      <PaginationLink onClick={() => onPageChange(totalPages)}>
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
                  />
                </PaginationItem>
                <PaginationItem>
                  <Button
                    onClick={() => onPageChange(totalPages)}
                    aria-label="Ir a la última página"
                  >
                    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </CardContent>
      </Card>

      <Dialog open={openDeleteRegist} onOpenChange={setOpenDeleteRegist}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] lg:max-w-[550px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Confirmar eliminación
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setOpenDeleteRegist(false)}
              aria-label="Cerrar diálogo"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="my-6">
            <p className="text-base text-gray-700 dark:text-gray-300 mb-1">
              ¿Estás seguro de que deseas eliminar este registro?
            </p>

            <p className="text-base text-gray-700 dark:text-gray-300 mb-1">
              El stock de los productos ingresados por este medio serán restados
            </p>

            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              Esta acción no se puede deshacer.
            </p>

            <Input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={passwordAdmin}
              onChange={(e) => setPasswordAdmin(e.target.value)}
              className="mt-2"
              aria-label="Contraseña de administrador"
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteRegist(false)}
                className="w-full sm:w-1/2"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRegist}
                className="w-full sm:w-1/2"
              >
                Confirmar eliminación
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeliveryDetailsDialog({ delivery }: { delivery: Delivery }) {
  const totalProductos = delivery.productos.reduce(
    (total, product) => total + product.cantidad,
    0
  );

  const costoTotal = delivery.productos.reduce(
    (total, product) => total + product.cantidad * product.costoUnitario,
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="" />
          Ver Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2 h-6 w-6" />
            Detalles de Entrega #{delivery.id}
          </DialogTitle>
          <DialogDescription>
            Información completa sobre la entrega de stock
          </DialogDescription>
        </DialogHeader>

        {/* Resumen Total */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-transparent rounded-lg p-4 border mb-4">
          <div className="flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <span className="font-semibold">Total de Productos:</span>
            <span>{totalProductos}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span className="font-semibold">Costo Total:</span>
            <span>
              {new Intl.NumberFormat("es-GT", {
                style: "currency",
                currency: "GTQ",
              }).format(costoTotal)}
            </span>
          </div>
        </div>

        {/* Información del Proveedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Información del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <dt className="font-semibold flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Nombre
                </dt>
                <dd>{delivery?.proveedor?.nombre || "Proveedor eliminado"}</dd>
              </div>
              <div>
                <dt className="font-semibold flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Correo
                </dt>
                <dd>{delivery?.proveedor?.correo || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-semibold flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Teléfono
                </dt>
                <dd>{delivery?.proveedor?.telefono || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-semibold flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Dirección
                </dt>
                <dd>{delivery?.proveedor?.direccion || "N/A"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Box className="mr-2 h-5 w-5" />
              Productos Entregados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <ScrollArea className="h-[300px] overflow-x-auto">
                <Table className="min-w-full border-collapse">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-transparent">
                      <TableHead className="px-4 py-2 text-left font-semibold text-sm">
                        Nombre
                      </TableHead>
                      <TableHead className="px-4 py-2 text-right font-semibold text-sm">
                        Cantidad
                      </TableHead>
                      <TableHead className="px-4 py-2 text-right font-semibold text-sm">
                        Costo Unitario
                      </TableHead>
                      <TableHead className="px-4 py-2 text-right font-semibold text-sm">
                        Total
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-semibold text-sm">
                        Código
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left font-semibold text-sm">
                        Descripción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delivery.productos.map((product) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-gray-100 dark:hover:bg-red-500 transition-colors border-b"
                      >
                        <TableCell className="px-4 py-2 text-left">
                          {product.producto.nombre}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right">
                          {product.cantidad}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right">
                          {new Intl.NumberFormat("es-GT", {
                            style: "currency",
                            currency: "GTQ",
                          }).format(product.costoUnitario)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right">
                          {new Intl.NumberFormat("es-GT", {
                            style: "currency",
                            currency: "GTQ",
                          }).format(product.costoUnitario * product.cantidad)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-left">
                          <div className="flex items-center gap-1">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            {product.producto.codigoProducto}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 text-left">
                          <div className="flex items-center gap-1">
                            {product.producto.descripcion}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </ScrollArea>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import {
  Box,
  Calendar,
  Coins,
  Eye,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <ScrollArea className="h-[calc(100vh-300px)] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total Pagado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
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
          <Eye className="mr-2 h-4 w-4" />
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

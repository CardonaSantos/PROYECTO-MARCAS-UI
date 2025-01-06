import React, { useEffect, useState } from "react";
import { SalesType, SaleTypeOne } from "../../Utils/Types/Sales";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Eye, FileSpreadsheet } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
interface SalesTypeProp {
  sales: SalesType | null;
}

const API_URL = import.meta.env.VITE_API_URL;

type Departamento = {
  id: number;
  nombre: string;
};

const SalesCustomerTable: React.FC<SalesTypeProp> = ({ sales }) => {
  // const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  console.log(departamentos);

  //CREAR UN STATE PARA EL FILTRO, CON LAS PROPIEDADES QUE QUEREMOS FILTRAR Y QUE TIENE NUESTRO OBJETO A FILTRAR
  const [filtros, setFiltros] = useState({
    idVenta: "",
    nombreCliente: "",
    nombreVendedor: "",
    metodoPago: "",
    fechaInicio: "",
    fechaFin: "",
    montoMin: "",
    montoMax: "",
  });

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

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  useEffect(() => {
    getDepartamentos();
  }, []);

  //Filtrado
  const ventasFiltradas =
    sales &&
    sales.filter((venta) => {
      return (
        (filtros.idVenta === "" || venta.id === Number(filtros.idVenta)) &&
        venta.cliente.nombre
          .toLowerCase()
          .includes(filtros.nombreCliente.toLowerCase()) &&
        venta.vendedor.nombre
          .toLowerCase()
          .includes(filtros.nombreVendedor.toLowerCase()) &&
        (filtros.fechaInicio === "" ||
          new Date(venta.timestamp) >= new Date(filtros.fechaInicio)) &&
        (filtros.fechaFin === "" ||
          new Date(venta.timestamp) <= new Date(filtros.fechaFin)) &&
        (filtros.montoMin === "" || venta.monto >= Number(filtros.montoMin)) &&
        (filtros.montoMax === "" || venta.monto <= Number(filtros.montoMax))
      );
    });

  //SINO HAY NADA
  if (sales && sales.length <= 0) {
    return (
      <div>
        <h2 className="text-center text-xl font-bold">
          No hay prospectos disponibles
        </h2>
      </div>
    );
  }
  const ventasTotales = sales?.length;

  const handleExport = () => {
    // Logic to export inventory data
    console.log("Exporting inventory data as:");
  };
  const [selectedVenta, setSelectedVenta] = useState<SaleTypeOne | null>(null); // Estado para manejar la venta seleccionada
  // const [openModal, setOpenModal] = useState(null);
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  console.log("Las ventas son: ", sales);

  if (
    !sales ||
    sales.length <= 0 ||
    (ventasFiltradas && ventasFiltradas?.length <= 0)
  ) {
    return (
      <div>
        <h2>No hay ventas disponibles</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1">
      <h1 className="text-2xl font-bold mb-5 text-center">
        Historial de Ventas
      </h1>
      <div className="bg-muted p-4 rounded-lg mb-4 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="text-xl font-semibold">
            Total ventas: {ventasTotales}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport()}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por número de venta..."
              value={filtros.idVenta}
              onChange={(e) => handleFiltroChange("idVenta", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre cliente..."
              value={filtros.nombreCliente}
              onChange={(e) =>
                handleFiltroChange("nombreCliente", e.target.value)
              }
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <Input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) =>
                handleFiltroChange("fechaInicio", e.target.value)
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* registros de ventas... */}

      <div className="grid gap-6 md:grid-cols-1 shadow-xl">
        <Table>
          <TableCaption>Registros de ventas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Numero Venta</TableHead>
              <TableHead>Fecha Venta</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total con descuento</TableHead>
              <TableHead>Productos Vendidos</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Accion</TableHead>
              <TableHead>Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventasFiltradas &&
              ventasFiltradas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell>#{venta.id}</TableCell>
                  <TableCell>
                    {new Date(venta.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {venta.cliente.apellido
                      ? venta.cliente.nombre + " " + venta.cliente.apellido
                      : venta.cliente.nombre}
                  </TableCell>
                  <TableCell>Q{venta.montoConDescuento.toFixed(2)}</TableCell>
                  <TableCell>
                    {venta.productos.reduce(
                      (total, producto) => total + producto.cantidad,
                      0
                    )}{" "}
                  </TableCell>
                  <TableCell>{venta.vendedor.nombre}</TableCell>
                  <TableCell>
                    <a
                      href={`/comprobante-venta/${venta.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge variant="destructive">Comprobante</Badge>
                    </a>
                  </TableCell>
                  <TableCell>
                    {/* Trigger del dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedVenta(venta)}
                        >
                          <Eye className="" />
                        </Button>
                      </DialogTrigger>

                      {selectedVenta && selectedVenta.id === venta.id && (
                        <DialogContent className="sm:max-w-[550px] w-11/12 max-h-[90vh] overflow-y-auto">
                          <DialogTitle className="text-2xl font-bold mb-4">
                            Venta #{selectedVenta.id}
                          </DialogTitle>
                          <div className="space-y-4">
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
                                      {selectedVenta.cliente.nombre}
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
                                            <li key={index} className="text-sm">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <span className="font-medium">
                                                    {producto.producto.nombre}
                                                  </span>
                                                  <br />
                                                  {producto.cantidad} unidades a
                                                  Q{producto.precio.toFixed(2)}
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
                                                selectedVenta.productos.length -
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
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesCustomerTable;

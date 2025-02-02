import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Briefcase,
  CreditCard,
} from "lucide-react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
const API_URL = import.meta.env.VITE_API_URL;

//-------------------------------------------
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

// Tipos
type Departamento = {
  id: number;
  nombre: string;
};

type Municipio = {
  id: number;
  nombre: string;
  departamentoId: number;
};

type Cliente = {
  id: number;
  nombre: string;
  comentarios: string;
  correo: string;
  creadoEn: string;
  actualizadoEn: string;
  departamento: Departamento;
  direccion: string;
  municipio: Municipio;
  telefono: string;
  categoriasInteres: string[];
  preferenciaContacto: string;
  presupuestoMensual: string;
  tipoCliente: string;
};

type Venta = {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: string;
  timestamp: string;
  usuarioId: number;
  clienteId: number;
  visitaId: number;
};

type Vendedor = {
  id: number;
  nombre: string;
  correo: string;
  creadoEn: string;
  rol: string;
};

type Visita = {
  id: number;
  inicio: string;
  fin: string;
  usuarioId: number;
  clienteId: number;
  observaciones: string;
  motivoVisita: string;
  tipoVisita: string;
  estadoVisita: string;
  creadoEn: string;
  actualizadoEn: string;
  cliente: Cliente;
  ventas: Venta[];
  vendedor: Vendedor;
};

export default function VisitasTable() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [filtroVisita, setVisitaFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/date/get-visits-regists`);
        setVisitas(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filtradosVenta = visitas.filter((visita) => {
    const filtroFormato = filtroVisita.trim().toLowerCase();
    return [
      visita.cliente?.nombre,
      visita.cliente?.correo,
      visita.cliente?.telefono,
      visita.cliente?.direccion,
      visita.id.toString(),
    ].some((field) => field?.toLowerCase().includes(filtroFormato));
  });

  const totalPages = Math.ceil(filtradosVenta.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtradosVenta.slice(indexOfFirstItem, indexOfLastItem);

  const onPageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-xl bg-white dark:bg-transparent">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Briefcase className="mr-2 h-6 w-6 text-primary" />
            Registro de Visitas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 bg-gray-50 dark:bg-gray-700"
              value={filtroVisita}
              onChange={(e) => setVisitaFiltro(e.target.value)}
              placeholder="Buscar por nombre, teléfono, dirección, número de visita"
              aria-label="Buscar visitas"
            />
          </div>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Cliente</TableHead>
                  <TableHead className="w-[200px]">Fecha Inicio</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((visita) => (
                  <TableRow key={visita.id}>
                    <TableCell>{visita.cliente?.nombre ?? "N/A"}</TableCell>
                    <TableCell>
                      {visita.inicio
                        ? formatearFecha(visita.inicio)
                        : "Fecha no disponible"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEstadoVariant(visita.estadoVisita)}>
                        {visita.estadoVisita ?? "Desconocido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {visita.tipoVisita ?? "No especificado"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center">
                              <FileText className="mr-2 h-6 w-6 text-primary" />
                              Detalles de la Visita
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[80vh] mt-4">
                            <DetallesVisita visita={visita} />
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-center pt-6">
          <Pagination aria-label="Navegación de páginas">
            <PaginationContent>
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Primero
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
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Último
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}

function DetallesVisita({ visita }: { visita: Visita }) {
  const calcularDuracionVisita = (
    creadoEn: string | undefined,
    actualizadoEn: string | undefined
  ): string => {
    if (!creadoEn || !actualizadoEn) {
      return "Información insuficiente";
    }

    const inicio = new Date(creadoEn);
    const fin = new Date(actualizadoEn);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return "Fechas no válidas";
    }

    const diferenciaMs = fin.getTime() - inicio.getTime();
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    const horasTexto = horas === 1 ? "hora" : "horas";
    const minutosTexto = minutos === 1 ? "minuto" : "minutos";

    return `${horas} ${horasTexto} y ${minutos} ${minutosTexto}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoSection title="Información de la Visita" icon={Calendar}>
          <p>
            <strong>Inicio:</strong>{" "}
            {visita.inicio ? formatearFecha(visita.inicio) : "No disponible"}
          </p>
          <p>
            <strong>Fin:</strong>{" "}
            {visita.fin ? formatearFecha(visita.fin) : "No disponible"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <Badge variant={getEstadoVariant(visita.estadoVisita)}>
              {visita.estadoVisita ?? "Desconocido"}
            </Badge>
          </p>
          <p>
            <strong>Tipo:</strong> {visita.tipoVisita ?? "No especificado"}
          </p>
          <p>
            <strong>Motivo:</strong> {visita.motivoVisita ?? "No especificado"}
          </p>
        </InfoSection>

        <InfoSection title="Información del Cliente" icon={User}>
          <p>
            <strong>Nombre:</strong> {visita.cliente?.nombre ?? "No disponible"}
          </p>
          <p>
            <strong>Tipo de Cliente:</strong>{" "}
            {visita.cliente?.tipoCliente ?? "No especificado"}
          </p>
          <p>
            <strong>Presupuesto Mensual:</strong>{" "}
            {visita.cliente?.presupuestoMensual
              ? `Q${visita.cliente.presupuestoMensual}`
              : "No especificado"}
          </p>
          <p>
            <strong>Preferencia de Contacto:</strong>{" "}
            {visita.cliente?.preferenciaContacto ?? "No especificada"}
          </p>
        </InfoSection>

        <InfoSection title="Ubicación" icon={MapPin}>
          <p>
            <strong>Dirección:</strong>{" "}
            {visita.cliente?.direccion ?? "No disponible"}
          </p>
          <p>
            <strong>Municipio:</strong>{" "}
            {visita.cliente?.municipio?.nombre ?? "No disponible"}
          </p>
          <p>
            <strong>Departamento:</strong>{" "}
            {visita.cliente?.departamento?.nombre ?? "No disponible"}
          </p>
        </InfoSection>

        <InfoSection title="Contacto" icon={Phone}>
          <p>
            <strong>Teléfono:</strong>{" "}
            {visita.cliente?.telefono ?? "No disponible"}
          </p>
          <p>
            <strong>Correo:</strong> {visita.cliente?.correo ?? "No disponible"}
          </p>
        </InfoSection>

        <InfoSection title="Vendedor" icon={User}>
          <p>
            <strong>Nombre:</strong> {visita.vendedor?.nombre ?? "No asignado"}
          </p>
          <p>
            <strong>Correo:</strong>{" "}
            {visita.vendedor?.correo ?? "No disponible"}
          </p>
          <p>
            <strong>Rol:</strong> {visita.vendedor?.rol ?? "No especificado"}
          </p>
        </InfoSection>

        <InfoSection title="Ventas" icon={DollarSign}>
          {visita.ventas && visita.ventas.length > 0 ? (
            visita.ventas.map((venta, index) => (
              <div
                key={venta.id}
                className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="font-semibold">Venta {index + 1}:</p>
                <p>Monto: Q{venta.monto.toFixed(2)}</p>
                <p>
                  Descuento: {venta.descuento ? `${venta.descuento}%` : "N/A"}
                </p>
                <p>
                  Monto con Descuento:{" "}
                  {venta.montoConDescuento
                    ? `Q${venta.montoConDescuento.toFixed(2)}`
                    : "N/A"}
                </p>
                <p className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Método de Pago: {venta.metodoPago}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No se registraron ventas en esta visita.
            </p>
          )}
        </InfoSection>
      </div>

      <InfoSection title="Observaciones" icon={FileText}>
        <p>{visita.observaciones ?? "Sin observaciones"}</p>
      </InfoSection>

      <InfoSection title="Información Adicional" icon={Clock}>
        <p>
          <strong>Creado en:</strong>{" "}
          {visita.creadoEn ? formatearFecha(visita.creadoEn) : "No disponible"}
        </p>
        <p>
          <strong>Actualizado en:</strong>{" "}
          {visita.actualizadoEn
            ? formatearFecha(visita.actualizadoEn)
            : "No disponible"}
        </p>
        <p>
          <strong>Duración de la visita:</strong>{" "}
          {calcularDuracionVisita(visita.creadoEn, visita.actualizadoEn)}
        </p>
      </InfoSection>
    </div>
  );
}

function InfoSection({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <section className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-primary">
        <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
        {title}
      </h3>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

function getEstadoVariant(
  estado: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (estado?.toLowerCase()) {
    case "completada":
      return "default";
    case "pendiente":
      return "secondary";
    case "cancelada":
      return "destructive";
    default:
      return "outline";
  }
}

// function getEstadoIcon(estado: string): React.ReactNode {
//   switch (estado?.toLowerCase()) {
//     case "completada":
//       return <CheckCircle className="w-4 h-4 text-green-500" />;
//     case "pendiente":
//       return <Clock className="w-4 h-4 text-yellow-500" />;
//     case "cancelada":
//       return <XCircle className="w-4 h-4 text-red-500" />;
//     default:
//       return <HelpCircle className="w-4 h-4 text-gray-500" />;
//   }
// }

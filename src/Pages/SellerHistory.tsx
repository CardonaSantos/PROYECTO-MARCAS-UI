import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Search,
  User,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Asistencias } from "../Utils/Types/Attendance";
import { format, differenceInMinutes } from "date-fns"; // Importar differenceInMinutes también
import { es } from "date-fns/locale"; // Importar el idioma español
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

export default function SellerHistory() {
  const [assistencia, setAssistencia] = useState<Asistencias>([]);
  const [busqueda, setBusqueda] = useState("");

  // Filtrado del historial según búsqueda, estado y fechas
  const historialFiltrado = assistencia.filter((registro) => {
    const filtroFormato = busqueda.trim().toLocaleLowerCase();

    const coincidencias =
      registro.usuario.nombre
        .trim()
        .toLocaleLowerCase()
        .includes(filtroFormato) ||
      registro.usuario.correo
        .trim()
        .toLocaleLowerCase()
        .includes(filtroFormato);

    return coincidencias;
  });

  useEffect(() => {
    const getAttendance = async () => {
      const response = await axios.get(`${API_URL}/attendance`);
      if (response.status === 200) {
        setAssistencia(response.data);
      }
    };

    getAttendance();
  }, []);

  console.log(assistencia);

  const miFechayHora = new Date();
  console.log(miFechayHora);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // PAGINACIÓN
  const totalPages = Math.ceil((historialFiltrado?.length || 0) / itemsPerPage);
  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    historialFiltrado &&
    historialFiltrado.slice(indexOfFirstItem, indexOfLastItem);
  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Historial de Entrada y Salida
      </h1>

      {/* Buscador */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por empleado, tienda, o dirección"
            className="pl-10 pr-4 py-2 w-full"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar registros"
          />
        </div>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden shadow-lg rounded-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-center text-xl font-semibold">
            Registros de Empleados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    <User className="inline-block mr-2" />
                    Empleado
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <Calendar className="inline-block mr-2" />
                    Fecha
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <Clock className="inline-block mr-2" />
                    Entrada
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <Clock className="inline-block mr-2" />
                    Salida
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <Clock className="inline-block mr-2" />
                    Tiempo Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems && currentItems.length > 0 ? (
                  currentItems.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell className="font-medium">
                        {registro.usuario.nombre}
                      </TableCell>
                      <TableCell>
                        {format(new Date(registro.entrada), "dd MMMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(registro.entrada), "hh:mm a", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        {registro.salida ? (
                          format(new Date(registro.salida), "hh:mm a", {
                            locale: es,
                          })
                        ) : (
                          <span className="text-yellow-500">Sin cerrar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {registro.salida ? (
                          `${Math.floor(
                            differenceInMinutes(
                              new Date(registro.salida),
                              new Date(registro.entrada)
                            ) / 60
                          )}h ${
                            differenceInMinutes(
                              new Date(registro.salida),
                              new Date(registro.entrada)
                            ) % 60
                          }m`
                        ) : (
                          <span className="text-blue-500">En curso</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-8"
                    >
                      No hay registros disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Paginación */}
        <CardFooter className="flex justify-center py-4 ">
          <Pagination aria-label="Navegación de páginas">
            <PaginationContent>
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  aria-label="Ir a la primera página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>

              {/* Truncado de páginas */}
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
                        aria-current={page === currentPage ? "page" : undefined}
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
                  disabled={currentPage === totalPages}
                  aria-label="Ir a la última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}

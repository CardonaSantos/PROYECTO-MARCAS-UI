import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Search, MapPin, Building, DollarSign, X } from "lucide-react";

import {
  ArrowUpDown,
  User,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingIcon,
  CalendarIcon,
  Tags,
  DollarSignIcon,
  MessageCircleIcon,
  ShoppingBag,
  LocateIcon,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
} from "lucide-react";

import { MultiSelect } from "react-multi-select-component";

interface OpcionInteres {
  label: string;
  value: string;
}

export interface Ubicacion {
  id: number;
  latitud: number;
  longitud: number;
}

export interface Municipio {
  id: number;
  nombre: number;
  departamentoId: number;
}

export interface Departamento {
  id: number;
  nombre: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: string;
  municipioId: number;
  municipio: Municipio;
  departamentoId: number;
  departamento: Departamento;
  ubicacionId: number;
  tipoCliente: string;
  categoriasInteres: string[];
  volumenCompra: string;
  presupuestoMensual: string;
  preferenciaContacto: string;
  comentarios: string;
  ventas: any[]; // Puedes definir una interfaz más específica si es necesario
  ubicacion: Ubicacion;
}
const API_URL = import.meta.env.VITE_API_URL;
interface UserTokenInfo {
  nombre: string;
  correo: string;
  rol: string;
  sub: number;
}

export default function ClientesList() {
  const [customers, setCustomers] = useState<Cliente[] | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState<Cliente[] | null>(
    null
  );
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    departamentoId: "",
    municipioId: "",
    volumenCompra: "",
    presupuestoMensual: "",
    intereses: [] as string[], // Nuevo filtro de intereses
  });
  const [searchQuery, setSearchQuery] = useState("");
  const opcionesIntereses: OpcionInteres[] = [
    { label: "Ropa de Mujer", value: "Ropa de Mujer" },
    { label: "Ropa de Hombre", value: "Ropa de Hombre" },
    { label: "Ropa Infantil", value: "Ropa Infantil" },
    { label: "Accesorios", value: "Accesorios" },
    { label: "Calzado", value: "Calzado" },
    { label: "Ropa Deportiva", value: "Ropa Deportiva" },
    { label: "Ropa Formal", value: "Ropa Formal" },
    { label: "Ropa de Trabajo", value: "Ropa de Trabajo" },
    { label: "Ropa de Marca", value: "Ropa de Marca" },
  ];
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const [tokenUser, setTokenUser] = useState<UserTokenInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  async function getCustomers() {
    try {
      const response = await axios.get(
        `${API_URL}/customers/get-all-customers`
      );
      if (response.status === 200) {
        setCustomers(response.data);
        setFilteredCustomers(response.data); // Inicialmente, todos los clientes se muestran
      }
    } catch (error) {
      console.log(error);
      toast.info("No se encontraron clientes");
    }
  }

  useEffect(() => {
    getCustomers();
  }, []);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/customer-location/get-departamentos`
        );
        setDepartamentos(response.data);
      } catch (error) {
        console.error("Error fetching departamentos", error);
      }
    };

    fetchDepartamentos();
  }, []);

  // Maneja el filtro de departamentos
  const handleSelectDepartamento = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const departamentoId = Number(event.target.value);
    setFiltros((prev) => ({ ...prev, departamentoId: event.target.value }));

    if (departamentoId) {
      try {
        const response = await axios.get(
          `${API_URL}/customer-location/get-municipios/${departamentoId}`
        );
        const data = response.data;
        if (Array.isArray(data)) {
          setMunicipios(data);
        } else {
          setMunicipios([]);
        }
      } catch (error) {
        console.error("Error fetching municipios", error);
      }
    }
  };

  // Maneja el filtro de municipios
  const handleSelectMunicipio = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFiltros((prev) => ({ ...prev, municipioId: event.target.value }));
  };

  // Maneja los otros filtros
  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      [name]: value,
    }));
  };

  // Aplicar filtros a los clientes
  // useEffect(() => {
  //   if (customers) {
  //     const filtered = customers.filter((cliente) => {
  //       const matchesSearch =
  //         searchQuery === "" ||
  //         (cliente.nombre?.toLowerCase() || "").includes(
  //           searchQuery.toLowerCase()
  //         ) ||
  //         (cliente.apellido?.toLowerCase() || "").includes(
  //           searchQuery.toLowerCase()
  //         ) ||
  //         (
  //           (cliente.nombre?.toLowerCase() || "") +
  //           " " +
  //           (cliente.apellido?.toLowerCase() || "")
  //         ).includes(searchQuery.toLowerCase()) ||
  //         (cliente.telefono?.toLowerCase() || "").includes(
  //           searchQuery.toLowerCase()
  //         ) ||
  //         (cliente.correo?.toLowerCase() || "").includes(
  //           searchQuery.toLowerCase()
  //         );

  //       return (
  //         matchesSearch &&
  //         (filtros.departamentoId === "" ||
  //           cliente.departamentoId === Number(filtros.departamentoId)) &&
  //         (filtros.municipioId === "" ||
  //           cliente.municipioId === Number(filtros.municipioId)) &&
  //         (filtros.volumenCompra === "" ||
  //           cliente.volumenCompra === filtros.volumenCompra) &&
  //         (filtros.presupuestoMensual === "" ||
  //           cliente.presupuestoMensual === filtros.presupuestoMensual)
  //       );
  //     });
  //     setFilteredCustomers(filtered);
  //   }
  // }, [filtros, searchQuery, customers]);

  useEffect(() => {
    if (customers) {
      const filtered = customers.filter((cliente) => {
        const matchesSearch =
          searchQuery === "" ||
          (cliente.nombre?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (cliente.apellido?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (
            (cliente.nombre?.toLowerCase() || "") +
            " " +
            (cliente.apellido?.toLowerCase() || "")
          ).includes(searchQuery.toLowerCase()) ||
          (cliente.telefono?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (cliente.correo?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          );

        // Verifica si el cliente tiene al menos un interés seleccionado
        const matchesInterests =
          filtros.intereses.length === 0 ||
          filtros.intereses.some((interes) =>
            cliente.categoriasInteres.includes(interes)
          );

        return (
          matchesSearch &&
          matchesInterests && // Aplicamos el filtro de intereses
          (filtros.departamentoId === "" ||
            cliente.departamentoId === Number(filtros.departamentoId)) &&
          (filtros.municipioId === "" ||
            cliente.municipioId === Number(filtros.municipioId)) &&
          (filtros.volumenCompra === "" ||
            cliente.volumenCompra === filtros.volumenCompra) &&
          (filtros.presupuestoMensual === "" ||
            cliente.presupuestoMensual === filtros.presupuestoMensual)
        );
      });
      setFilteredCustomers(filtered);
    }
  }, [filtros, searchQuery, customers]);

  console.log("Los departamentos son: ", departamentos);
  console.log("los municipios son: ", municipios);
  console.log("Los datos filtrados son: ", filteredCustomers);

  const handleLimpiarFiltro = () => {
    setFiltros({
      nombre: "",
      apellido: "",
      departamentoId: "",
      municipioId: "",
      volumenCompra: "",
      presupuestoMensual: "",
      intereses: [],
    });
    setFilteredCustomers(customers);
    setMunicipios([]);
  };

  const [sortColumn, setSortColumn] = useState<keyof Cliente>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedClientes = [...(filteredCustomers || [])].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: keyof Cliente) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // PAGINACIÓN
  const totalPages = Math.ceil((sortedClientes?.length || 0) / itemsPerPage);

  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    sortedClientes && sortedClientes.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Directorio de Clientes</h1>
      <Card className="w-full mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="col-span-full">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nombre, teléfono, correo"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Buscar clientes"
                />
              </div>
            </div>

            <Select
              onValueChange={(value) =>
                handleSelectDepartamento({
                  target: { value },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
            >
              <SelectTrigger className="w-full">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos &&
                  departamentos.map((depa) => (
                    <SelectItem value={String(depa.id)} key={depa.id}>
                      {depa.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                handleSelectMunicipio({
                  target: { value },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
            >
              <SelectTrigger className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Municipio" />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={String(municipio.id)}>
                    {municipio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                handleFiltroChange({
                  target: { name: "volumenCompra", value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <SelectTrigger className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Volumen de compra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bajo">Bajo (1 - 30 unidades)</SelectItem>

                <SelectItem value="medio">Medio (31 - 90 unidades)</SelectItem>
                <SelectItem value="alto">Alto (91 - 150 unidades)</SelectItem>
                <SelectItem value="muyAlto">
                  Muy Alto (más de 150 unidades)
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                handleFiltroChange({
                  target: { name: "presupuestoMensual", value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <SelectTrigger className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Presupuesto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menos5000">Menos de Q5,000</SelectItem>
                <SelectItem value="5000-10000">Q5,000 - Q10,000</SelectItem>
                <SelectItem value="10001-20000">Q10,000 - Q20,000</SelectItem>
                <SelectItem value="mas20000">Más de Q20,000</SelectItem>
              </SelectContent>
            </Select>

            <MultiSelect
              options={opcionesIntereses}
              value={opcionesIntereses.filter((opcion) =>
                filtros.intereses.includes(opcion.value)
              )}
              onChange={(selected: OpcionInteres[]) =>
                setFiltros((prev) => ({
                  ...prev,
                  intereses: selected.map((item) => item.value),
                }))
              }
              labelledBy="Seleccionar Intereses"
              className="text-black"
              overrideStrings={{
                allItemsAreSelected: "Todos los elementos están seleccionados",
                clearSearch: "Limpiar búsqueda",
                noOptions: "No hay opciones",
                search: "Buscar...",
                selectAll: "Seleccionar todo",
                selectSomeItems: "Selecciona intereses...",
              }}
            />

            <Button
              onClick={handleLimpiarFiltro}
              variant="outline"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtro
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Lista de Clientes
              </div>
              <span className="font-bold">
                {filteredCustomers?.length} resultados
              </span>
            </CardTitle>

            <CardDescription>
              Gestiona y visualiza la información de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("nombre")}
                      className="cursor-pointer"
                    >
                      Nombre <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("tipoCliente")}
                      className="cursor-pointer"
                    >
                      Tipo <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("correo")}
                      className="cursor-pointer"
                    >
                      Correo <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("telefono")}
                      className="cursor-pointer"
                    >
                      Teléfono <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.apellido
                          ? cliente.nombre + " " + cliente.apellido
                          : cliente.nombre}
                      </TableCell>
                      <TableCell>{cliente.tipoCliente}</TableCell>
                      <TableCell>{cliente.correo}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                  {cliente.nombre}
                                </DialogTitle>
                                <DialogDescription>
                                  Detalles completos del cliente
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Información de contacto
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2" />
                                      <span>
                                        {cliente.apellido
                                          ? cliente.nombre +
                                            " " +
                                            cliente.apellido
                                          : cliente.nombre}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <MailIcon className="h-4 w-4 mr-2" />
                                      <span>{cliente.correo}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <PhoneIcon className="h-4 w-4 mr-2" />
                                      <span>{cliente.telefono}</span>
                                    </div>
                                    <div className="flex items-center col-span-full">
                                      <MapPinIcon className="h-4 w-4 mr-2" />
                                      <span>{cliente.direccion}</span>
                                    </div>
                                    <div className="flex items-center col-span-full">
                                      <BuildingIcon className="h-4 w-4 mr-2" />
                                      <span>{`${cliente.municipio.nombre}, ${cliente.departamento.nombre}`}</span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Detalles del cliente
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      <span>
                                        Cliente desde:{" "}
                                        {new Date(
                                          cliente.creadoEn
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Tags className="h-4 w-4 mr-2" />
                                      <span>Tipo: {cliente.tipoCliente}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSignIcon className="h-4 w-4 mr-2" />
                                      <span>
                                        Presupuesto:{" "}
                                        {cliente.presupuestoMensual ||
                                          "No especificado"}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <MessageCircleIcon className="h-4 w-4 mr-2" />
                                      <span>
                                        Contacto preferido:{" "}
                                        {cliente.preferenciaContacto ||
                                          "No especificado"}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      <span>
                                        Volumen de compra:{" "}
                                        {cliente.volumenCompra ||
                                          "No especificado"}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <ShoppingBag className="h-4 w-4 mr-2" />
                                      <span>
                                        Compras:{" "}
                                        {cliente.ventas?.length ||
                                          "No hay ventas registradas"}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Intereses y comentarios
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <strong>Categorías de interés:</strong>
                                      <p>
                                        {cliente.categoriasInteres?.join(
                                          ", "
                                        ) || "Ninguno"}
                                      </p>
                                    </div>
                                    <Separator />
                                    <div>
                                      <strong>Comentarios:</strong>
                                      <p>
                                        {cliente.comentarios ||
                                          "Sin comentarios"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {cliente.ubicacion?.latitud &&
                                  cliente.ubicacion?.longitud && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg font-semibold">
                                          Ubicación
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center justify-center">
                                          <LocateIcon className="mr-2 h-4 w-4" />
                                          <a
                                            href={`https://www.google.com/maps/?q=${cliente.ubicacion.latitud},${cliente.ubicacion.longitud}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                          >
                                            Ver ubicación guardada
                                          </a>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link
                                  to={`/historial-cliente-ventas/${cliente.id}`}
                                  className="flex items-center"
                                >
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                  Ver historial de compras
                                </Link>
                              </DropdownMenuItem>
                              {tokenUser?.rol === "ADMIN" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Link
                                      to={`/editar-cliente/${cliente.id}`}
                                      className="flex items-center"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar cliente
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar cliente
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    onClick={() => onPageChange(1)}
                    variant="outline"
                    size="sm"
                  >
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
                    onClick={() => onPageChange(totalPages)}
                    variant="outline"
                    size="sm"
                  >
                    Último
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

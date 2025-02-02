import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MapPin,
  User,
  Coins,
  ShoppingCart,
  Timer,
  Tags,
  MessageCircle,
  Phone,
  Building,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  UserPlus,
  Trash2,
} from "lucide-react";
import axios from "axios";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
const API_URL = import.meta.env.VITE_API_URL;

// Tipos
type Vendedor = {
  correo: string;
  id: number;
  nombre: string;
  rol: string;
};

type Ubicacion = {
  creadoEn: string;

  id: number;
  latitud: number;
  longitud: number;
  prospectoId: number;
};

type Municipio = {
  id: number;
  nombre: string;
  departamentoId: string;
};

type Departamento = {
  id: number;
  nombre: string;
};

type Prospecto = {
  id: number;
  inicio: string;
  fin: string | null;
  usuarioId: number;
  clienteId: number | null;
  nombreCompleto: string;
  apellido: string;
  empresaTienda: string;
  telefono: string;
  correo: string;
  direccion: string;
  municipioId: number;
  departamentoId: number;
  tipoCliente: string;
  categoriasInteres: string[];
  volumenCompra: string;
  presupuestoMensual: string;
  preferenciaContacto: string;
  comentarios: string;
  creadoEn: string;
  actualizadoEn: string;
  estado: string;
  vendedor: Vendedor;
  municipio: Municipio;
  departamento: Departamento;
  ubicacion: Ubicacion;
};

export default function ProspectoHistorial() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [prospectos2, setProspectos2] = useState<Prospecto[]>([]); // Inicializado como arreglo vacío

  const [selectedDepartamento, setSelectedDepartamento] = useState<
    number | null
  >(null);

  const [filtros, setFiltros] = useState({
    direccion: "",
    municipio: "",
    departamento: "",
    estado: "",
    tipoCliente: "",
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

  const handleSelectDepartamento = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = Number(event.target.value);
    const selectedDep = departamentos.find((dep) => dep.id === id); // Buscar el departamento seleccionado

    setSelectedDepartamento(id);

    if (selectedDep) {
      handleFiltroChange("departamento", selectedDep.nombre); // Guardar el nombre del departamento
    }

    try {
      const response = await axios.get(
        `${API_URL}/customer-location/get-municipios/${id}`
      );
      if (response.status === 200) {
        setMunicipios(response.data); // Actualizar municipios
      }
    } catch (error) {
      console.error("Error al obtener municipios", error);
      toast.error("No se pudieron cargar los municipios.");
    }
  };

  const handleSelectMunicipio = (value: string) => {
    handleFiltroChange("municipio", value); // Guardar el nombre del municipio
  };

  useEffect(() => {
    getDepartamentos();
  }, []);

  const getProspectos = async () => {
    try {
      const response = await axios.get<Prospecto[]>(`${API_URL}/prospecto`);
      if (response.status === 200) {
        setProspectos2(response.data);
      }
    } catch (error) {
      console.error("Error fetching prospectos:", error);
    }
  };

  useEffect(() => {
    getProspectos();
  }, []);

  const prospectosFiltrados = prospectos2.filter((prospecto) => {
    const filtroTexto = filtros.direccion.toLowerCase().trim();

    const coincideTexto =
      `${prospecto.nombreCompleto || ""} ${prospecto.apellido || ""}`
        .toLowerCase()
        .includes(filtroTexto) || // Buscar en nombre completo concatenado con apellido
      prospecto.empresaTienda?.toLowerCase().includes(filtroTexto) ||
      prospecto.telefono?.toLowerCase().includes(filtroTexto) ||
      prospecto.direccion?.toLowerCase().includes(filtroTexto);

    const coincideDepartamento =
      !filtros.departamento ||
      (prospecto.departamento &&
        prospecto.departamento.nombre === filtros.departamento);

    const coincideMunicipio =
      !filtros.municipio ||
      (prospecto.municipio && prospecto.municipio.nombre === filtros.municipio);

    const coincideEstado =
      !filtros.estado || prospecto.estado === filtros.estado;

    const coincideTipoCliente =
      !filtros.tipoCliente || prospecto.tipoCliente === filtros.tipoCliente;

    return (
      coincideTexto &&
      coincideDepartamento &&
      coincideMunicipio &&
      coincideEstado &&
      coincideTipoCliente
    );
  });

  function calcularDiferenciaTiempo(inicio: Date, fin: Date) {
    // Verificar que las fechas sean válidas instancias de Date
    if (!(inicio instanceof Date) || !(fin instanceof Date)) {
      return "Tiempo no disponible";
    }

    // Calculamos la diferencia en milisegundos
    const diferenciaMs = fin.getTime() - inicio.getTime();

    if (diferenciaMs < 0) {
      return "Fecha de fin es anterior a la fecha de inicio";
    }

    // Convertimos la diferencia a horas, minutos y segundos
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    // Formatear el resultado con manejo de plurales
    const formatoHoras = horas === 1 ? "hora" : "horas";
    const formatoMinutos = minutos === 1 ? "minuto" : "minutos";
    return `${horas} ${formatoHoras}, ${minutos} ${formatoMinutos}`;
  }

  console.log("Departamento seleccionado:", selectedDepartamento);
  console.log("Filtros actuales:", filtros);
  console.log("Prospectos filtrados:", prospectosFiltrados);

  const [openProspect, setOpenProspect] = useState(false);

  const handleCreateCustomer = async (prospectoId: number) => {
    const prospecto = prospectosFiltrados.find(
      (prospecto) => prospecto.id == prospectoId
    );

    if (!prospecto) {
      toast.info("No se puede generar el cliente");
      return;
    }

    console.log("El prospecto seleccionado es: ", prospecto);

    const newCustomer = {
      prospectoId: prospectoId,
      nombre: prospecto.nombreCompleto,
      apellido: prospecto.apellido || "",
      correo: prospecto.correo || "",
      telefono: prospecto.telefono || "",
      direccion: prospecto.direccion || "",
      municipioId: prospecto.municipio?.id || null,
      departamentoId: prospecto.departamento?.id || null,
      tipoCliente: prospecto.tipoCliente || "",
      volumenCompra: prospecto.volumenCompra || "",
      presupuestoMensual: prospecto.presupuestoMensual || "",
      preferenciaContacto: prospecto.preferenciaContacto || "",
      categoriasInteres: prospecto.categoriasInteres || [],
      comentarios: prospecto.comentarios || "",
      latitud: prospecto.ubicacion ? prospecto.ubicacion.latitud : null,
      longitud: prospecto.ubicacion ? prospecto.ubicacion.longitud : null,
    };

    console.log("Lo que estamos enviando es: ", newCustomer);

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const response = await axios.post(
              `${API_URL}/customers/create-customer-from-prospect`,
              newCustomer
            );
            if (response.status === 201 || response.status === 200) {
              resolve("Usuario registrado con éxito");
              getProspectos();
              setOpenProspect(false);
            } else {
              reject(new Error("Error al crear nuevo usuario"));
            }
          } catch (error) {
            reject(new Error("Error al crear nuevo usuario"));
          }
        }, 1000); // Tiempo de espera de 2 segundos
      }),
      {
        loading: "Registrando usuario...",
        success: "Usuario registrado con éxito",
        error: "Error al registrar usuario ",
      }
    );
  };

  const [selectedProspect, setSelectedProspect] = useState<Prospecto | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // PAGINACIÓN
  const totalPages = Math.ceil(
    (prospectosFiltrados?.length || 0) / itemsPerPage
  );
  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    prospectosFiltrados &&
    prospectosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatBudget = (budget: string) => {
    switch (budget) {
      case "menos5000":
        return "Menos de Q5,000";
      case "5000-10000":
        return "Q5,000 - Q10,000";
      case "10001-20000":
        return "Q10,001 - Q20,000";
      case "mas20000":
        return "Más de Q20,000";
      default:
        return "Sin presupuesto";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Registros de Prospectos</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar nombre, dirección, teléfono"
            value={filtros.direccion}
            onChange={(e) => handleFiltroChange("direccion", e.target.value)}
            aria-label="Buscar por nombre, dirección o teléfono"
            className="pl-10"
          />
        </div>
        <Select
          onValueChange={(value) =>
            handleSelectDepartamento({
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>)
          }
        >
          <SelectTrigger aria-label="Seleccionar departamento">
            <Building className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((departamento) => (
              <SelectItem
                key={departamento.id}
                value={departamento.id.toString()}
              >
                {departamento.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleSelectMunicipio}>
          <SelectTrigger aria-label="Seleccionar municipio">
            <MapPin className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Municipio" />
          </SelectTrigger>
          <SelectContent>
            {municipios.map((municipio) => (
              <SelectItem key={municipio.id} value={municipio.nombre}>
                {municipio.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => handleFiltroChange("tipoCliente", value)}
        >
          <SelectTrigger aria-label="Seleccionar tipo de cliente">
            <User className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo de cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mayorista">Mayorista</SelectItem>
            <SelectItem value="Minorista">Minorista</SelectItem>
            <SelectItem value="Boutique">Boutique</SelectItem>
            <SelectItem value="TiendaEnLinea">Tienda En Línea</SelectItem>
            <SelectItem value="ClienteIndividual">
              Cliente Individual
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() =>
            setFiltros({
              direccion: "",
              municipio: "",
              departamento: "",
              estado: "",
              tipoCliente: "",
            })
          }
          aria-label="Limpiar todos los filtros"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      </div>

      {/* Lista de Prospectos */}
      <div className="space-y-4">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Lista de Prospectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems &&
                    currentItems.map((prospect) => (
                      <TableRow key={prospect.id}>
                        <TableCell>
                          {prospect.apellido
                            ? prospect.nombreCompleto + " " + prospect.apellido
                            : prospect.nombreCompleto || "N/A"}
                        </TableCell>
                        <TableCell>{prospect.empresaTienda || "N/A"}</TableCell>
                        <TableCell>{prospect.telefono || "N/A"}</TableCell>
                        <TableCell>
                          {prospect.vendedor?.nombre || "Sin asignar"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              prospect.estado === "EN_PROSPECTO"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {prospect.estado === "CERRADO"
                              ? "CANCELADO"
                              : prospect.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {prospect.creadoEn
                            ? new Date(prospect.creadoEn).toLocaleString(
                                "es-GT",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "Fecha no disponible"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setOpenProspect(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <Dialog onOpenChange={setOpenProspect} open={openProspect}>
              {selectedProspect && (
                <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {selectedProspect.apellido
                        ? `${selectedProspect.nombreCompleto || ""} ${
                            selectedProspect.apellido
                          }`
                        : selectedProspect.nombreCompleto ||
                          "Nombre no disponible"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Mail className="mr-2 h-5 w-5" />
                          Información de contacto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            {selectedProspect.correo || "Correo no disponible"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            {selectedProspect.telefono ||
                              "Teléfono no disponible"}
                          </span>
                        </div>
                        <div className="flex items-center col-span-full">
                          <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            {selectedProspect.direccion ||
                              "Dirección no disponible"}
                          </span>
                        </div>
                        <div className="flex items-center col-span-full">
                          <Building
                            className="h-4 w-4 mr-2"
                            aria-hidden="true"
                          />
                          <span>{`${
                            selectedProspect.municipio?.nombre ||
                            "Municipio no disponible"
                          }, ${
                            selectedProspect.departamento?.nombre ||
                            "Departamento no disponible"
                          }`}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Detalles del prospecto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            Tipo:{" "}
                            {selectedProspect.tipoCliente || "No especificado"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <ShoppingCart
                            className="h-4 w-4 mr-2"
                            aria-hidden="true"
                          />
                          <span>
                            Volumen:{" "}
                            {selectedProspect.volumenCompra ||
                              "No especificado"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            Presupuesto:{" "}
                            {selectedProspect.presupuestoMensual
                              ? formatBudget(
                                  selectedProspect.presupuestoMensual
                                )
                              : "No especificado"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            Vendedor:{" "}
                            {selectedProspect.vendedor?.nombre || "No asignado"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            Duración:{" "}
                            {selectedProspect.inicio && selectedProspect.fin
                              ? calcularDiferenciaTiempo(
                                  new Date(selectedProspect.inicio),
                                  new Date(selectedProspect.fin)
                                )
                              : "En progreso..."}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Preferencias y comentarios
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center">
                          <Tags className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>
                            Intereses:{" "}
                            {selectedProspect.categoriasInteres?.length > 0
                              ? selectedProspect.categoriasInteres.join(", ")
                              : "No especificados"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle
                            className="h-4 w-4 mr-2"
                            aria-hidden="true"
                          />
                          <span>
                            Contacto preferido:{" "}
                            {selectedProspect.preferenciaContacto ||
                              "No especificado"}
                          </span>
                        </div>
                        <Separator />
                        <div>
                          <strong>Comentarios:</strong>
                          <p>
                            {selectedProspect.comentarios || "Sin comentarios"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedProspect.ubicacion && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5" />
                            Ubicación
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center">
                            <MapPin
                              className="mr-2 h-4 w-4"
                              aria-hidden="true"
                            />
                            <a
                              href={`https://www.google.com/maps/?q=${selectedProspect.ubicacion.latitud},${selectedProspect.ubicacion.longitud}`}
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

                    <Button
                      onClick={() => handleCreateCustomer(selectedProspect.id)}
                      disabled={
                        !!selectedProspect.clienteId ||
                        selectedProspect.estado === "CERRADO"
                      }
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {selectedProspect.clienteId
                        ? "Cliente ya generado"
                        : "Generar Cliente"}
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </CardContent>
          <CardFooter className="flex items-center justify-center">
            <div className="flex items-center justify-center py-4">
              <Pagination aria-label="Navegación de páginas">
                <PaginationContent>
                  <PaginationItem>
                    <Button onClick={() => onPageChange(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Primero
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    />
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
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      onClick={() => onPageChange(totalPages)}
                    >
                      Último
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

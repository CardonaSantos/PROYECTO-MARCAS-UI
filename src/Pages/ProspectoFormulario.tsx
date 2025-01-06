import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import { UserToken } from "@/Utils/Types/UserTokenInfo";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  Coins,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
  User,
  UserCircle,
} from "lucide-react";
//-------------
// Interfaz para Prospecto
interface Prospecto {
  id: number;
  inicio: string; // Fecha en formato ISO
  fin: string | null; // Puede ser null si aún está activo
  usuarioId: number;
  clienteId: number | null; // Puede ser null si no está asociado a un cliente
  nombreCompleto: string;
  apellido: string;
  empresaTienda: string;
  telefono: string | null;
  correo: string | null;
  direccion: string;
  departamentoId: number; // Referencia al ID del departamento
  municipioId: number; // Referencia al ID del municipio
  estado: string; // Podría ser un enum para estados específicos
  preferenciaContacto: string | null;
  presupuestoMensual: number | null;
  volumenCompra: number | null;
  categoriasInteres: string[]; // O una interfaz para una categoría si tienes más detalles
  comentarios: string | null;
  creadoEn: string; // Fecha en formato ISO
  actualizadoEn: string; // Fecha en formato ISO
  departamento?: Departamento; // Opcional, si deseas incluir la relación
  municipio?: Municipio; // Opcional, si deseas incluir la relación
}

interface Departamento {
  nombre: string;
  id: number;
}

interface Municipio {
  nombre: string;
  id: number;
}

interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
}
// Tipo para nuestro formulario
type FormData = {
  nombreCompleto: string;
  apellido: string;
  empresaTienda: string;
  telefono: string;
  correo: string;
  direccion: string;
  municipio: string;
  departamento: string;
  tipoCliente: string;
  categoriasInteres: string[];
  volumenCompra: string;
  presupuestoMensual: string;
  preferenciaContacto: string;
  comentarios: string;
  fin: string;
  //ubiccaciones
  departamentoId: number;
  municipioId: number;
  // latitud: ,
  // longitud: null,
  latitud?: number; // Aquí se define como number
  longitud?: number; // Aquí se define como number
};

const fechaHoraGuatemala = new Date().toLocaleString("es-GT", {
  timeZone: "America/Guatemala",
});

export default function ProspectoFormulario() {
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: "",
    apellido: "",
    empresaTienda: "",
    telefono: "",
    correo: "",
    direccion: "",
    municipio: "",
    departamento: "",
    tipoCliente: "",
    categoriasInteres: [],
    volumenCompra: "",
    presupuestoMensual: "",
    preferenciaContacto: "",
    comentarios: "",
    fin: fechaHoraGuatemala,
    municipioId: 0,
    departamentoId: 0,
    //-----------------------
    latitud: 0,
    longitud: 0,
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitud: position.coords.latitude, // Esto será un número
            longitud: position.coords.longitude, // Esto será un número
          });
          toast.success("Ubicación obtenida exitosamente");
        },
        (error) => {
          console.log(error);
          toast.error("Error al obtener la ubicación");
        }
      );
      console.log("El form data con la latitud y lng es: ", formData);
    } else {
      toast.error("La geolocalización no es compatible con este navegador.");
    }
  };

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (categoria: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categoriasInteres: checked
        ? [...prev.categoriasInteres, categoria]
        : prev.categoriasInteres.filter((c) => c !== categoria),
    }));
  };

  //-------------------------------------------------
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("authToken");
  const [vendedor, setVendedor] = useState<UserToken | null>(null);

  useEffect(() => {
    if (token) {
      setVendedor(jwtDecode<UserToken>(token));
    }
  }, [token]);

  const [prospectoAbierto, setProspectoAbierto] = useState<Prospecto | null>(
    null
  );
  console.log("El ultimo prospecto abierto es: ", prospectoAbierto);

  const [prospectBoolean, setProspectBoolean] = useState(false);
  async function fetchLastProspecto(vendedorId: number) {
    try {
      const response = await fetch(
        `${API_URL}/prospecto/abierto/${vendedorId}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener el prospecto");
      }
      const prospecto: Prospecto = await response.json();
      setProspectBoolean(true);

      return prospecto;
    } catch (error) {
      console.error("Error:", error);
      //   setError("No se pudo obtener el prospecto abierto.");
      return null; // Devuelve null si hay un error
    }
  }
  console.log("El last prospecto es: ", prospectoAbierto);

  // Cargar prospecto abierto
  useEffect(() => {
    const getLastProspecto = async () => {
      if (vendedor?.sub) {
        try {
          const lastProspecto: Prospecto | null = await fetchLastProspecto(
            vendedor.sub
          );
          if (lastProspecto) {
            setProspectoAbierto(lastProspecto);
            setFormData((prevFormData) => ({
              ...prevFormData,
              nombreCompleto: lastProspecto.nombreCompleto || "",
              apellido: lastProspecto.apellido || "",
              empresaTienda: lastProspecto.empresaTienda || "",
              telefono: lastProspecto.telefono || "",
              correoElectronico: lastProspecto.correo || "",
              direccion: lastProspecto.direccion || "",
              municipioId: lastProspecto.municipioId || 0,
              departamentoId: lastProspecto.departamentoId || 0,
              municipio: lastProspecto.municipio?.nombre || "", // Asignar nombre del municipio
              departamento: lastProspecto.departamento?.nombre || "", // Asignar nombre del departamento
              fin: lastProspecto.fin || fechaHoraGuatemala, // Si aún no está cerrado
              // Rellena otros campos si es necesario
            }));
          } else {
            // Manejar caso en que no hay prospecto
            setFormData({
              nombreCompleto: "",
              apellido: "",
              empresaTienda: "",
              telefono: "",
              correo: "",
              direccion: "",
              municipio: "",
              departamento: "",
              tipoCliente: "",
              categoriasInteres: [],
              volumenCompra: "",
              presupuestoMensual: "",
              preferenciaContacto: "",
              comentarios: "",
              fin: fechaHoraGuatemala,
              municipioId: 0,
              departamentoId: 0,
            });
          }
        } catch (error) {
          console.error("Error al obtener el prospecto:", error);
          // Manejar error
        }
      }
    };

    if (vendedor?.sub) {
      getLastProspecto(); // Asegurarse que getLastProspecto funcione bien
    }
  }, [vendedor?.sub]);

  console.log(formData);

  const handleFinishProspect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.tipoCliente ||
      !formData.nombreCompleto ||
      !formData.empresaTienda ||
      !formData.direccion
    ) {
      toast.warning("Algunos campos son necesarios");
      return;
    }

    if (!formData.tipoCliente) {
      toast.warning("Especifique el tipo de cliente");
    }

    try {
      console.log("enviando.....");
      console.log({
        nombreCompleto: formData.nombreCompleto,
        apellido: formData.apellido,
        empresaTienda: formData.empresaTienda,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        tipoCliente: formData.tipoCliente,
        categoriasInteres: formData.categoriasInteres,
        volumenCompra: formData.volumenCompra,
        presupuestoMensual: formData.presupuestoMensual,
        preferenciaContacto: formData.preferenciaContacto,
        comentarios: formData.comentarios,
        //
      });

      console.log("El id del prospecto abierto es: ", prospectoAbierto?.id);

      const response = await axios.patch(
        `${API_URL}/prospecto/actualizar-prospecto/${prospectoAbierto?.id}`,
        {
          nombreCompleto: formData.nombreCompleto,
          empresaTienda: formData.empresaTienda,
          telefono: formData.telefono,
          correo: formData.correo,
          tipoCliente: formData.tipoCliente,
          categoriasInteres: formData.categoriasInteres,
          volumenCompra: formData.volumenCompra,
          presupuestoMensual: formData.presupuestoMensual,
          preferenciaContacto: formData.preferenciaContacto,
          comentarios: formData.comentarios,
          fin: fechaHoraGuatemala,
          estado: "FINALIZADO",
          departamentoId: formData.departamentoId,
          municipioId: formData.municipioId,
          latitud: formData.latitud,
          longitud: formData.longitud,

          // latitud: formData.la
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Prospecto finalizado...");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al actualizar y finalizar prosecto");
    }
  };
  const postProspecto = async () => {
    // Validaciones mínimas
    if (
      !formData.nombreCompleto &&
      !formData.empresaTienda &&
      !formData.apellido
    ) {
      toast.info(
        "Se necesita al menos un referente (nombre completo o empresa/tienda)"
      );
      return;
    }

    if (!formData.departamentoId || !formData.municipioId) {
      toast.info("Selecciona un departamento y municipio");
      return;
    }

    try {
      setIsSubmitting(true); // Evita múltiples envíos

      const response = await axios.post(`${API_URL}/prospecto`, {
        nombreCompleto: formData.nombreCompleto,
        apellido: formData.apellido,
        empresaTienda: formData.empresaTienda,
        direccion: formData.direccion,
        departamentoId: formData.departamentoId, // Enviar el ID del departamento
        municipioId: formData.municipioId, // Enviar el ID del municipio
        usuarioId: vendedor?.sub, // Asegúrate de que vendedor?.sub esté definido
      });

      if (response.status === 201) {
        toast.info("Registro de prospecto iniciado");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSubmitError(
        "Hubo un error al enviar el formulario. Por favor, intente de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [openCancelProspecto, setOpenCancelProspecto] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false); // Para evitar múltiples envíos

  const handleCancelProspect = async () => {
    if (isSubmittingCancel) return; // Truncar si ya está en proceso

    if (!prospectoAbierto?.id) {
      toast.warning("No se encontró el prospecto a cancelar.");
      return;
    }

    setIsSubmittingCancel(true); // Marcar como enviando

    try {
      console.log("Cancelando prospecto...");
      const response = await axios.patch(
        `${API_URL}/prospecto/cancelar-prospecto/${prospectoAbierto?.id}`,
        {
          nombreCompleto: formData.nombreCompleto,
          empresaTienda: formData.empresaTienda,
          telefono: formData.telefono,
          correo: formData.correo,
          tipoCliente: formData.tipoCliente,
          categoriasInteres: formData.categoriasInteres,
          volumenCompra: formData.volumenCompra,
          presupuestoMensual: formData.presupuestoMensual,
          preferenciaContacto: formData.preferenciaContacto,
          comentarios: formData.comentarios,
          fin: new Date().toISOString(),
          estado: "CERRADO", // Cambiar estado a "CERRADO" para cancelar
          departamentoId: formData.departamentoId,
          municipioId: formData.municipioId,
          latitud: formData.latitud,
          longitud: formData.longitud,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Prospecto cancelado correctamente.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al cancelar el prospecto:", error);
      toast.error("Error al cancelar el prospecto.");
    } finally {
      setIsSubmittingCancel(false); // Restablecer el estado
      setOpenCancelProspecto(false); // Cerrar el dialog
    }
  };

  //-----------------LOGICA PARA SELECCIONAR UN DEPARTAMENTO Y SUS MUNICIPIOS-----------------------------
  const [departamentos2, setDepartamentos] = useState<Departamento[]>([]);
  // const [selectedDepartamento, setSelectedDepartamento] = useState<number>();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/customer-location/get-departamentos`
        ); // Ajusta la URL según tu API
        setDepartamentos(response.data);
      } catch (error) {
        console.error("Error fetching departamentos", error);
      }
    };

    fetchDepartamentos();
  }, []);

  // Lógica para seleccionar un departamento y sus municipios
  const handleSelectDepartamento = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = Number(event.target.value);
    setFormData({
      ...formData,
      departamentoId: id,
      municipioId: 0,
      municipio: "",
    }); // Resetea municipio al seleccionar un departamento
    if (id) {
      const fetchMunicipios = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/customer-location/get-municipios/${id}`
          );
          const data = response.data;

          // Verifica que los datos recibidos sean un array antes de actualizarlos
          if (Array.isArray(data)) {
            setMunicipios(data);
          } else {
            setMunicipios([]); // Si no es un array, inicializa como array vacío
            console.error("Los datos recibidos no son un array:", data);
          }
        } catch (error) {
          console.error("Error fetching municipios", error);
        }
      };

      fetchMunicipios();
    }
  };

  const handleSelectMunicipio = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = Number(event.target.value);
    const selectedMunicipio = municipios.find((m) => m.id === id); // Asegúrate de que la propiedad ID esté presente en tu objeto municipio
    if (selectedMunicipio) {
      setFormData({
        ...formData,
        municipioId: id,
        municipio: selectedMunicipio.nombre,
      });
    }
  };
  const [open, setOpen] = useState(false); // Estado para controlar el diálogo
  const openDialog = () => setOpen(true); // Abrir el diálogo
  // const []
  return (
    <div className="container mx-auto px-4 py-8">
      {prospectBoolean ? (
        <Card className="w-full max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Registro de Nuevo Prospecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFinishProspect} className="space-y-8">
              {/* Información General */}
              <fieldset className="space-y-6">
                <legend className="text-xl font-semibold">
                  Información General
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="nombreCompleto"
                      className="flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Nombres*</span>
                    </Label>
                    <Input
                      id="nombreCompleto"
                      name="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={errors.nombreCompleto ? "true" : "false"}
                    />
                    {errors.nombreCompleto && (
                      <p className="text-red-500 text-sm" role="alert">
                        {errors.nombreCompleto}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="apellido"
                      className="flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Apellidos*</span>
                    </Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={errors.apellido ? "true" : "false"}
                    />
                    {errors.apellido && (
                      <p className="text-red-500 text-sm" role="alert">
                        {errors.apellido}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="empresaTienda"
                      className="flex items-center space-x-2"
                    >
                      <Building className="w-4 h-4" />
                      <span>Empresa/Tienda (opcional)</span>
                    </Label>
                    <Input
                      id="empresaTienda"
                      name="empresaTienda"
                      value={formData.empresaTienda}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="telefono"
                      className="flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Teléfono*</span>
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={errors.telefono ? "true" : "false"}
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-sm" role="alert">
                        {errors.telefono}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="correo"
                      className="flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Correo</span>
                    </Label>
                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      value={formData.correo}
                      onChange={handleInputChange}
                      aria-invalid={errors.correo ? "true" : "false"}
                    />
                    {errors.correo && (
                      <p className="text-red-500 text-sm" role="alert">
                        {errors.correo}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="direccion"
                      className="flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Dirección</span>
                    </Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="municipio"
                      className="flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Municipio/Pueblo*</span>
                    </Label>
                    <Input
                      id="municipio"
                      name="municipio"
                      value={formData.municipio}
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="departamento"
                      className="flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Departamento*</span>
                    </Label>
                    <Input
                      id="departamento"
                      name="departamento"
                      value={formData.departamento}
                      aria-required="true"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Tipo de Cliente */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <UserCircle className="w-5 h-5" />
                  <span>Tipo de Cliente*</span>
                </legend>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("tipoCliente", value)
                  }
                  aria-required="true"
                  aria-invalid={errors.tipoCliente ? "true" : "false"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el tipo de cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minorista">
                      Minorista (vende al consumidor final)
                    </SelectItem>
                    <SelectItem value="Mayorista">
                      Mayorista (compra en grandes volúmenes)
                    </SelectItem>
                    <SelectItem value="Boutique">
                      Boutique/Tienda Especializada
                    </SelectItem>
                    <SelectItem value="TiendaEnLinea">
                      Tienda en Línea
                    </SelectItem>
                    <SelectItem value="ClienteIndividual">
                      Cliente Individual
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoCliente && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.tipoCliente}
                  </p>
                )}
              </fieldset>

              {/* Categorías de Interés */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Categorías de Interés</span>
                </legend>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Ropa de Mujer",
                    "Ropa de Hombre",
                    "Ropa Infantil",
                    "Accesorios",
                    "Calzado",
                    "Ropa Deportiva",
                    "Ropa Formal",
                    "Ropa de Trabajo",
                    "Ropa de Marca",
                  ].map((categoria) => (
                    <div
                      key={categoria}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={categoria}
                        checked={formData.categoriasInteres.includes(categoria)}
                        onChange={(e) =>
                          handleCheckboxChange(categoria, e.target.checked)
                        }
                      />
                      <Label htmlFor={categoria}>{categoria}</Label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Volumen de Compra Estimado Mensual */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Volumen de Compra Estimado Mensual</span>
                </legend>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("volumenCompra", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el volumen de compra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bajo">Bajo (1 - 30 unidades)</SelectItem>
                    <SelectItem value="medio">
                      Medio (31 - 90 unidades)
                    </SelectItem>
                    <SelectItem value="alto">
                      Alto (91 - 150 unidades)
                    </SelectItem>
                    <SelectItem value="muyAlto">
                      Muy Alto (más de 150 unidades)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </fieldset>

              {/* Presupuesto Mensual Aproximado */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>Presupuesto Mensual Aproximado</span>
                </legend>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("presupuestoMensual", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el presupuesto mensual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos5000">Menos de Q5,000</SelectItem>
                    <SelectItem value="5000-10000">Q5,000 - Q10,000</SelectItem>
                    <SelectItem value="10001-20000">
                      Q10,001 - Q20,000
                    </SelectItem>
                    <SelectItem value="mas20000">Más de Q20,000</SelectItem>
                  </SelectContent>
                </Select>
              </fieldset>

              {/* Preferencia de Comunicación */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Preferencia de Comunicación</span>
                </legend>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("preferenciaContacto", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione la preferencia de contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Correo Electrónico</SelectItem>
                    <SelectItem value="telefono">Teléfono</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="visita">Visita en Persona</SelectItem>
                  </SelectContent>
                </Select>
              </fieldset>

              {/* Comentarios o Necesidades Específicas */}
              <fieldset className="space-y-4">
                <legend className="text-xl font-semibold flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Comentarios o Notas</span>
                </legend>
                <Textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  placeholder="Ingrese cualquier comentario adicional, nota o requisitos especiales"
                  className="min-h-[100px]"
                />
              </fieldset>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full sm:w-auto"
                >
                  Obtener ubicación actual
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Enviando..." : "Finalizar Prospecto"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setOpenCancelProspecto(true)}
                >
                  Cancelar Prospecto
                </Button>

                <Dialog
                  open={openCancelProspecto}
                  onOpenChange={setOpenCancelProspecto}
                >
                  <DialogContent>
                    <DialogHeader>
                      <h2 className="text-lg font-semibold">
                        Cancelar Prospecto
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        ¿Estás seguro de que deseas cancelar este prospecto?
                        Esta acción no puede deshacerse.
                      </p>
                    </DialogHeader>

                    <DialogFooter>
                      <form
                        onSubmit={handleCancelProspect}
                        className="flex gap-2"
                      >
                        <Button
                          // type="button"
                          type="submit"
                          variant="destructive"
                          disabled={isSubmittingCancel}
                        >
                          {isSubmittingCancel
                            ? "Cancelando..."
                            : "Si, cancelar"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenCancelProspecto(false)}
                        >
                          Cerrar
                        </Button>
                      </form>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div>
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Nuevo Registro de Prospecto
              </CardTitle>
            </CardHeader>
            <form onSubmit={(e) => e.preventDefault()}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="nombreCompleto"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Nombres*</span>
                  </Label>
                  <Input
                    id="nombreCompleto"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    aria-required="true"
                    aria-invalid={errors.nombreCompleto ? "true" : "false"}
                  />
                  {errors.nombreCompleto && (
                    <p className="text-red-500 text-sm" role="alert">
                      {errors.nombreCompleto}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="apellido"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Apellidos*</span>
                  </Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    aria-required="true"
                    aria-invalid={errors.apellido ? "true" : "false"}
                  />
                  {errors.apellido && (
                    <p className="text-red-500 text-sm" role="alert">
                      {errors.apellido}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="empresaTienda"
                    className="flex items-center space-x-2"
                  >
                    <Building className="w-4 h-4" />
                    <span>Empresa/Tienda (opcional)</span>
                  </Label>
                  <Input
                    id="empresaTienda"
                    name="empresaTienda"
                    value={formData.empresaTienda}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="direccion"
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Dirección*</span>
                  </Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    aria-required="true"
                    aria-invalid={errors.direccion ? "true" : "false"}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm" role="alert">
                      {errors.direccion}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="departamento"
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Departamento*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectDepartamento({
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    value={String(formData.departamentoId)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Departamentos</SelectLabel>
                        {departamentos2.map((departamento) => (
                          <SelectItem
                            key={departamento.id}
                            value={String(departamento.id)}
                          >
                            {departamento.nombre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="municipio"
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Municipio*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectMunicipio({
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    value={String(formData.municipioId)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Municipios</SelectLabel>
                        {Array.isArray(municipios) &&
                          municipios.map((municipio) => (
                            <SelectItem
                              key={municipio.id}
                              value={String(municipio.id)}
                            >
                              {municipio.nombre}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="button" className="w-full" onClick={openDialog}>
                  Iniciar Prospecto
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Dialogo de confirmación */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Confirmar Registro de Prospecto
                </DialogTitle>
              </DialogHeader>
              <p className="text-center">
                ¿Está seguro de que desea iniciar este prospecto con la
                información ingresada?
              </p>
              <DialogFooter className="flex gap-2 justify-center items-center">
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full"
                  onClick={async () => {
                    await postProspecto();
                    setOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

//#1

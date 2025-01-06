import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const API_URL = import.meta.env.VITE_API_URL;

import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  ShoppingCart,
  DollarSign,
  Tag,
  MessageCircle,
  MapPinned,
  FileText,
} from "lucide-react";

type FormData = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  municipio: string;
  departamento: string;
  tipoCliente: string;
  categoriasInteres: string[];
  volumenCompra: string;
  presupuestoMensual: string;
  preferenciaContacto: string;
  comentarios: string;
  departamentoId: number;
  municipioId: number;
  latitud?: number; // Aquí se define como number
  longitud?: number; // Aquí se define como number
};

interface Departamento {
  nombre: string;
  id: number;
}

interface Municipio {
  nombre: string;
  id: number;
}

export default function CreateClient() {
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [departamentos2, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    municipio: "",
    departamento: "",
    tipoCliente: "",
    categoriasInteres: [],
    volumenCompra: "",
    presupuestoMensual: "",
    preferenciaContacto: "",
    comentarios: "",
    departamentoId: 0,
    municipioId: 0,
    latitud: 0, // Aquí se define como number
    longitud: 0, // Aquí se define como number
  });
  console.log("La data a enviar es: ", formData);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", formData);
    try {
      const response = await axios.post(`${API_URL}/customers/`, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        municipioId: formData.municipioId,
        departamentoId: formData.departamentoId,
        latitud: formData.latitud,
        longitud: formData.longitud,
        tipoCliente: formData.tipoCliente,
        categoriasInteres: formData.categoriasInteres,
        volumenCompra: formData.volumenCompra,
        presupuestoMensual: formData.presupuestoMensual,
        preferenciaContacto: formData.preferenciaContacto,
        comentarios: formData.comentarios,
      }); // Envía el objeto directamente
      if (response.status === 201) {
        toast.success("Cliente creado exitosamente");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error("Error al crear cliente");
    }
  };

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

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCoordenadasCliente = (value: string) => {
    const [lat, lng] = value
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));

    setFormData((prevData) => ({
      ...prevData,
      latitud: lat,
      longitud: lng,
    }));
  };

  const handleCheckboxChange = (categoria: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categoriasInteres: checked
        ? [...prev.categoriasInteres, categoria]
        : prev.categoriasInteres.filter((c) => c !== categoria),
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Users className="h-6 w-6" />
          Crear Nuevo Cliente
        </CardTitle>
        <CardDescription>
          Ingrese los detalles del nuevo cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombres
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="nombres"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Apellidos
              </Label>
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="apellidos"
                // aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="502 3277 6558, 502 5555 0000"
                // aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo
              </Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="correoelectronico@gmail.com (Opcional)"
                // required
                // aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </Label>
              <Textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Jacaltenango, Cantón Pila Zona 2"
                // required
                // aria-required="true"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Departamento*
              </Label>
              <Select
                onValueChange={(value) =>
                  handleSelectDepartamento({
                    target: { value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                value={String(formData.departamentoId)}
              >
                <SelectTrigger>
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
              <Label htmlFor="municipio" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Municipio*
              </Label>
              <Select
                onValueChange={(value) =>
                  handleSelectMunicipio({
                    target: { value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                value={String(formData.municipioId)}
              >
                <SelectTrigger>
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
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tipo de Cliente*
            </h2>
            <Select
              onValueChange={(value) =>
                handleSelectChange("tipoCliente", value)
              }
            >
              <SelectTrigger>
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
                <SelectItem value="TiendaEnLinea">Tienda en Línea</SelectItem>
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
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Volumen de Compra Estimado Mensual
            </h2>
            <Select
              onValueChange={(value) =>
                handleSelectChange("volumenCompra", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el volumen de compra" />
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
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Presupuesto Mensual Aproximado
            </h2>
            <Select
              onValueChange={(value) =>
                handleSelectChange("presupuestoMensual", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el presupuesto mensual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menos5000">Menos de Q5,000</SelectItem>
                <SelectItem value="5000-10000">Q5,000 - Q10,000</SelectItem>
                <SelectItem value="10001-20000">Q10,001 - Q20,000</SelectItem>
                <SelectItem value="mas20000">Más de Q20,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categorías de Interés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <div key={categoria} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={categoria}
                    checked={formData.categoriasInteres.includes(categoria)}
                    onChange={(e) =>
                      handleCheckboxChange(categoria, e.target.checked)
                    }
                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <Label htmlFor={categoria}>{categoria}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Preferencia de Comunicación
            </h2>
            <Select
              onValueChange={(value) =>
                handleSelectChange("preferenciaContacto", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la preferencia de contacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Correo Electrónico</SelectItem>
                <SelectItem value="telefono">Teléfono</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="visita">Visita en Persona</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPinned className="h-5 w-5" />
              Añadir ubicación
            </h2>
            <div className="flex gap-2">
              <Input
                onChange={(e) => handleCoordenadasCliente(e.target.value)}
                placeholder="por ejemplo: 15.665394064189494, -91.71131300914816"
                aria-label="Coordenadas del cliente"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comentarios o Notas
            </h2>
            <Textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleInputChange}
              placeholder="Ingrese cualquier comentario adicional, nota o requisitos especiales"
              aria-label="Comentarios o notas adicionales"
            />
          </div>

          <Button type="submit" className="w-full">
            Crear Cliente
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

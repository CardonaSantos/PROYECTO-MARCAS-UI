"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
import { Departamento, Municipio } from "../Customers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export type UserToken = {
  nombre: string;
  correo: string;
  rol: string;
  sub: number;
  iat: number;
  exp: number;
};

type FormData = {
  nombre: string;
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
  ubicacion: {
    latitud: string;
    longitud: string;
  };
};

interface Descuento {
  id: number;
  porcentaje: number;
  clienteId: number;
  activo: boolean;
  creadoEn: string; // Formato ISO string
  actualizadoEn: string; // Formato ISO string
}

export default function EditCustomer() {
  const initialFormData: FormData = {
    nombre: "",
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
    ubicacion: {
      latitud: "",
      longitud: "",
    },
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [departamentos2, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const { id: clienteId } = useParams<{ id: string }>(); // Obtener el clienteId de la URL
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  // Obtener el userId desde el token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken: UserToken = jwtDecode(token);
      setUsuarioId(decodedToken.sub);
    }
  }, []);

  // Obtener los datos del cliente y precargarlos en el formulario
  useEffect(() => {
    const handleGetCustomer = async () => {
      if (!clienteId) return;

      try {
        const response = await axios.get(`${API_URL}/customers/${clienteId}`);
        if (response.status === 200) {
          console.log("El customer en el response es: ", response.data);

          setFormData((prevData) => ({
            ...prevData,
            ...response.data,
          })); // Combinar los datos existentes con los recibidos
        }
      } catch (error) {
        toast.error("Error al obtener los datos del cliente.");
      }
    };

    handleGetCustomer();
  }, [clienteId]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectDepartamento = (value: string) => {
    const id = Number(value);
    const selectedDepartamento = departamentos2.find((d) => d.id === id);

    setFormData((prevState) => ({
      ...prevState,
      departamentoId: id,
      departamento:
        selectedDepartamento && typeof selectedDepartamento.nombre === "string"
          ? selectedDepartamento.nombre
          : "", // Asegúrate de que esto sea un string
      municipioId: formData.municipioId,
      municipio: formData.municipio,
    }));

    if (id) {
      const fetchMunicipios = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/customer-location/get-municipios/${id}`
          );
          const data = response.data;

          if (Array.isArray(data)) {
            setMunicipios(data);
          } else {
            setMunicipios([]);
            console.error("Los datos recibidos no son un array:", data);
          }
        } catch (error) {
          console.error("Error fetching municipios", error);
        }
      };

      fetchMunicipios();
    }
  };

  const handleSelectMunicipio = (value: string) => {
    const id = Number(value);
    const selectedMunicipio = municipios.find((m) => m.id === id);
    if (selectedMunicipio) {
      setFormData((prevState) => ({
        ...prevState,
        municipioId: id,
        municipioNombre: selectedMunicipio.nombre, // Almacena el nombre aquí
      }));
    }
  };

  // const handleCoordenadasCliente = (value: string) => {
  //   const [lat, lng] = value
  //     .split(",")
  //     .map((coord: string) => parseFloat(coord.trim()));

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     latitud: lat,
  //     longitud: lng,
  //   }));
  // };

  // Cargar departamentos al montar el componente
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId || !usuarioId || !formData) {
      toast.error("Faltan datos necesarios para continuar.");
      return;
    }

    const data = {
      ...formData,
      clienteId: Number(clienteId),
      usuarioId,
    };

    try {
      const response = await axios.patch(
        `${API_URL}/customers/${clienteId}`,
        data
      );
      if (response.status === 200) {
        toast.success("Cliente actualizado correctamente.");
      }
    } catch (error) {
      toast.error("Error al actualizar el cliente.");
    }
  };
  console.log("El cliente actual es: ", formData);
  const handleCheckboxChange = (categoria: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categoriasInteres: checked
        ? [...prev.categoriasInteres, categoria]
        : prev.categoriasInteres.filter((c) => c !== categoria),
    }));
  };

  const [descuentos, setDescuentos] = useState<Descuento[]>();

  const getCustomerDiscounts = async () => {
    const response = await axios.get(
      `${API_URL}/discount/cliente/${clienteId}`
    );

    if (response.status === 200) {
      setDescuentos(response.data);
    }
  };
  useEffect(() => {
    const getCustomerDiscounts = async () => {
      const response = await axios.get(
        `${API_URL}/discount/cliente/${clienteId}`
      );

      if (response.status === 200) {
        setDescuentos(response.data);
      }
    };
    getCustomerDiscounts();
  }, []);
  console.log("Los descuentos de este cliente son: ", descuentos);

  //ESTADOS PARA OPERAR DESCUENTOS
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [descuentoId, setDescuentoId] = useState<Number>(0);

  const [showDialgCreateDiscount, setShowDialgCreateDiscount] = useState(false);

  const [porcentaje, setPorcentaje] = useState<Number>();
  async function handleConfirmCreateDiscount() {
    console.log("CREANDO...");

    try {
      const response = await axios.post(`${API_URL}/discount`, {
        porcentaje: porcentaje,
        clienteId: Number(clienteId),
      });
      if (response.status === 200 || 201) {
        toast.success("Nuevo descuento añadido");
        getCustomerDiscounts();
        setShowDialgCreateDiscount(false);
        setPorcentaje(0);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear instancia");
    }
  }

  const handleDesctivate = async () => {
    console.log(descuentoId);

    try {
      const response = await axios.patch(
        `${API_URL}/discount/desactivate-discount/${descuentoId}`,
        {
          descuentoId: descuentoId,
        }
      );
      if (response.status === 200 || 201) {
        toast.success("Descuento actualizado");
        setShowDeleteDialog(false);
        getCustomerDiscounts();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear instancia");
    }
  };

  const [openDescuentos, setOpenDescuentos] = useState(false);
  return (
    <div className="">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Editar Cliente</CardTitle>
          <CardDescription>Modifique los detalles del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder="Correo del cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Teléfono del cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Dirección del cliente"
                required
              />
            </div>

            <div>
              <Label htmlFor="departamento">Departamento*</Label>
              <Select
                onValueChange={handleSelectDepartamento}
                value={
                  formData.departamentoId ? String(formData.departamentoId) : ""
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cambiar departamento" />
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

            <div>
              <Label htmlFor="municipio">Municipio*</Label>
              <Select
                onValueChange={handleSelectMunicipio}
                value={formData.municipioId ? String(formData.municipioId) : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cambiar municipio" />
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

            {/* Tipo de Cliente */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tipo de Cliente*</h2>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("tipoCliente", value)
                }
                value={formData.tipoCliente}
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
                <p className="text-red-500 text-sm">{errors.tipoCliente}</p>
              )}
            </div>

            {/* Volumen de Compra Estimado Mensual */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Volumen de Compra Estimado Mensual
              </h2>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("volumenCompra", value)
                }
                value={formData.volumenCompra}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el volumen de compra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajo">Bajo (1 - 50 unidades)</SelectItem>
                  <SelectItem value="medio">
                    Medio (51 - 200 unidades)
                  </SelectItem>
                  <SelectItem value="alto">
                    Alto (201 - 500 unidades)
                  </SelectItem>
                  <SelectItem value="muyAlto">
                    Muy Alto (más de 500 unidades)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Presupuesto Mensual Aproximado */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Presupuesto Mensual Aproximado
              </h2>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("presupuestoMensual", value)
                }
                value={formData.presupuestoMensual}
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
              <h2 className="text-xl font-semibold">Categorías de Interés</h2>
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

            {/* Preferencia de Comunicación */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Preferencia de Comunicación
              </h2>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("preferenciaContacto", value)
                }
                value={formData.preferenciaContacto}
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
            <h2 className="text-xl font-semibold">Añadir ubicación </h2>

            <div className="flex gap-2">
              <Input
                onChange={(e) => {
                  const [lat, lng] = e.target.value
                    .split(",")
                    .map((coord) => coord.trim());
                  setFormData({
                    ...formData,
                    ubicacion: {
                      latitud: lat || "",
                      longitud: lng || "",
                    },
                  });
                }}
                placeholder="por ejemplo: 15.665394064189494, -91.71131300914816"
                value={
                  formData?.ubicacion?.latitud && formData?.ubicacion?.longitud
                    ? `${formData?.ubicacion?.latitud}, ${formData?.ubicacion?.longitud}`
                    : ""
                }
              />
            </div>

            {/* Comentarios o Necesidades Específicas */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Comentarios o Notas</h2>
              <Textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                placeholder="Ingrese cualquier comentario adicional, nota o requisitos especiales"
              />
            </div>

            <Button
              type="button"
              onClick={() => setShowDialgCreateDiscount(true)}
              className="w-full"
            >
              Añadir porcentaje de descuento
            </Button>
            <Dialog
              open={showDialgCreateDiscount}
              onOpenChange={setShowDialgCreateDiscount}
            >
              <DialogContent className="p-6 rounded-lg shadow-lg max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-center">
                    Añadir Nueva Instancia
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      className="bg-transparent rounded-md p-2 w-20"
                      placeholder="0"
                      min="0"
                      max="100"
                      onChange={(e) => setPorcentaje(Number(e.target.value))}
                    />
                    <span className="text-lg font-semibold text-gray-700">
                      %
                    </span>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      type="button"
                      onClick={handleConfirmCreateDiscount}
                      className=""
                    >
                      Confirmar
                    </Button>
                    <Button
                      onClick={() => setShowDialgCreateDiscount(false)}
                      variant="destructive"
                      className=""
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* ADMINISTRACION DE DESCUENTOS */}
            <Button
              className="w-full"
              type="button"
              onClick={() => setOpenDescuentos(true)}
            >
              Descuentos disponibles
            </Button>

            <Dialog open={openDescuentos} onOpenChange={setOpenDescuentos}>
              <DialogContent className="p-6 shadow-lg  h-5/6 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-center mb-4">
                    Descuentos
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 hover:shadow-xl ">
                  {descuentos && descuentos.length > 0 ? (
                    descuentos.map((descuento) => (
                      <div
                        key={descuento.id}
                        className="p-4 border rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Porcentaje: {descuento.porcentaje}%
                          </p>
                          <p
                            className={`text-xs ${
                              descuento.activo
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {descuento.activo ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowDeleteDialog(true);
                              setDescuentoId(Number(descuento.id));
                            }}
                            className="bg-red-500 text-white"
                            type="button"
                          >
                            {descuento.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      No hay descuentos disponibles.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal para confirmar desactivación */}
            <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
              <DialogContent className="p-6 rounded-lg shadow-lg max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-center">
                    Desactivar Descuento
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="">
                    ¿Desea desactivar este descuento? Una vez desactivado no
                    podrá volver a usarse en otras instancias de venta, pero sus
                    referencias se mantendrán.
                  </p>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={handleDesctivate}
                    className="border-none"
                  >
                    Confirmar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDescuentoId(0);
                    }}
                    variant="destructive"
                    className="border-none"
                  >
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button type="submit" className="w-full">
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

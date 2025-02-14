import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  MapPin,
  Phone,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

import SelectComponent from "react-select";

const API_URL = import.meta.env.VITE_API_URL;
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Input } from "@/components/ui/input";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

enum MotivoVisita {
  COMPRA_CLIENTE = "COMPRA_CLIENTE",
  PRESENTACION_PRODUCTOS = "PRESENTACION_PRODUCTOS",
  NEGOCIACION_PRECIOS = "NEGOCIACION_PRECIOS",
  ENTREGA_MUESTRAS = "ENTREGA_MUESTRAS",
  PLANIFICACION_PEDIDOS = "PLANIFICACION_PEDIDOS",
  CONSULTA_CLIENTE = "CONSULTA_CLIENTE",
  SEGUIMIENTO = "SEGUIMIENTO",
  PROMOCION = "PROMOCION",
  OTRO = "OTRO",
}

enum TipoVisita {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
}

enum EstadoVisita {
  INICIADA = "INICIADA",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
}

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
}

interface UserToken {
  sub: number;
  // Add other properties as needed
}

interface Visita {
  id?: number;
  inicio: Date;
  fin?: Date;
  usuarioId: number | undefined;
  clienteId: number | null;
  observaciones?: string;
  motivoVisita?: MotivoVisita;
  tipoVisita?: TipoVisita;
  estadoVisita: EstadoVisita;
  cliente?: Cliente;
}

export default function RegistroVisita() {
  const [userToken, setUserToken] = useState<UserToken | null>(null);
  const [visitaActual, setVisitaActual] = useState<Visita | null>(null);
  const [nuevaVisita, setNuevaVisita] = useState<Omit<Visita, "id" | "inicio">>(
    {
      usuarioId: undefined,
      clienteId: null, // Permitir valores nulos
      motivoVisita: undefined,
      tipoVisita: undefined,
      estadoVisita: EstadoVisita.INICIADA,
    }
  );

  const [observaciones, setObservaciones] = useState("");
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<UserToken>(token);
        setUserToken(decodedToken);
        setNuevaVisita((prev) => ({ ...prev, usuarioId: decodedToken.sub }));
      } catch (error) {
        console.error("Error decodificando el token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const getRegistOpen = async () => {
      if (userToken) {
        try {
          const response = await axios.get(
            `${API_URL}/date/regist-open/${userToken.sub}`
          );
          if (response.status === 200) {
            setVisitaActual(response.data);
          }
        } catch (error) {
          console.error("Error al obtener registro abierto:", error);
        }
      }
    };

    getRegistOpen();
  }, [userToken]);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/customers/all-customers-with-discount`
        );
        if (response.status === 200) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error("Error al obtener clientes:", error);
        toast.error("No se encontraron clientes");
      }
    };

    getCustomers();
  }, []);

  const iniciarVisita = async () => {
    if (!nuevaVisita.clienteId) {
      toast.error("Debes seleccionar un cliente antes de iniciar la visita.");
      return;
    }

    try {
      const visitaConUsuarioId = {
        ...nuevaVisita,
        inicio: new Date(),
      };

      const response = await axios.post(
        `${API_URL}/date/start-new-visit`,
        visitaConUsuarioId
      );

      if (response.status === 201) {
        setVisitaActual(response.data);
        toast.success("Registro de visita iniciado");
        setTimeout(() => window.location.reload(), 200);
      }
    } catch (error) {
      console.error("Error al iniciar registro:", error);
      toast.error("Error al iniciar registro");
    }
  };

  const finalizarVisita = async () => {
    if (isSubmitting) return; // Evita múltiples clics

    setIsSubmitting(true);

    if (!visitaActual) {
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/date/update/visit-regist/${visitaActual.id}`,
        {
          fin: new Date(),
          observaciones,
        }
      );

      toast.success("Registro de visita finalizado");

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error al finalizar la visita:", error);
      toast.error("Error al finalizar la visita");
    } finally {
      // Esto asegura que isSubmitting solo se restablezca si NO se recarga la página
      setTimeout(() => setIsSubmitting(false), 1100);
    }
  };

  const [openCloseVisita, setOpenCloseVisita] = useState(false);
  const [observacionesClose, setObservacionesClose] = useState("");
  const [truncarClose, setTruncarClose] = useState(false);

  const cancelarVisita = async () => {
    if (visitaActual) {
      try {
        setTruncarClose(true);
        await axios.patch(
          `${API_URL}/date/cancel/visit-regist/${visitaActual.id}`,
          {
            estadoVisita: "CANCELADA",
            motivoCancelacion: observacionesClose,
          }
        );
        toast.success("Registro de visita cancelado");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error("Error al cancelar la visita:", error);
        toast.error("Error al cancelar la visita");
      } finally {
        setTruncarClose(false);
        setOpenCloseVisita(false);
      }
    }
  };

  // Opciones para el selector
  const options = customers.map((customer) => ({
    value: customer.id,
    label: customer.apellido
      ? `${customer.nombre} ${customer.apellido}`
      : customer.nombre,
  }));

  const [openConfirmFinish, setOpenConfirmFinish] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ClipboardList className="mr-2 h-6 w-6" />
          {visitaActual ? "Visita en Curso" : "Iniciar Nueva Visita"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visitaActual ? (
          <div className="space-y-6">
            <div className="flex items-center text-lg font-semibold">
              <Calendar className="mr-2 h-5 w-5" />
              <span>Visita iniciada el: </span>
              <span className="ml-2 text-blue-600">
                {formatearFecha(visitaActual.inicio.toString())}
              </span>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-semibold mr-2">Nombre:</span>
                  {visitaActual.cliente
                    ? `${visitaActual.cliente.nombre || ""} ${
                        visitaActual.cliente.apellido || ""
                      }`.trim()
                    : ""}
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  <span className="font-semibold mr-2">Teléfono:</span>
                  {visitaActual.cliente?.telefono}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="font-semibold mr-2">Dirección:</span>
                  {visitaActual.cliente?.direccion}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Observaciones
              </Label>
              <Textarea
                id="observaciones"
                placeholder="Ingrese sus observaciones aquí..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        ) : (
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cliente" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Cliente
              </Label>
              <SelectComponent
                className="text-black"
                id="cliente"
                options={options}
                // styles={customStyles}
                value={
                  selectedCustomer
                    ? {
                        value: selectedCustomer.id,
                        label: selectedCustomer.apellido
                          ? `${selectedCustomer.nombre} ${selectedCustomer.apellido}`
                          : selectedCustomer.nombre,
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    const customer =
                      customers.find((c) => c.id === selectedOption.value) ||
                      null;
                    setSelectedCustomer(customer);
                    setNuevaVisita((prev) => ({
                      ...prev,
                      clienteId: customer?.id || null, // Usar null en lugar de un valor no definido
                    }));
                  } else {
                    setSelectedCustomer(null);
                    setNuevaVisita((prev) => ({
                      ...prev,
                      clienteId: null,
                    }));
                  }
                }}
                placeholder="Seleccionar cliente..."
                isSearchable
                isClearable
                noOptionsMessage={() => "No se encontró el cliente."}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivoVisita" className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Motivo de la Visita
              </Label>
              <Select
                onValueChange={(value) =>
                  setNuevaVisita((prev) => ({
                    ...prev,
                    motivoVisita: value as MotivoVisita,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MotivoVisita).map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoVisita" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Tipo de Visita
              </Label>
              <Select
                onValueChange={(value) =>
                  setNuevaVisita((prev) => ({
                    ...prev,
                    tipoVisita: value as TipoVisita,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoVisita).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {visitaActual ? (
          <>
            <Button
              // onClick={finalizarVisita}
              onClick={() => {
                setOpenConfirmFinish(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finalizar Visita
            </Button>
            <Button
              variant="destructive"
              onClick={() => setOpenCloseVisita(true)}
              disabled={truncarClose}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar Visita
            </Button>
          </>
        ) : (
          <Button
            onClick={iniciarVisita}
            disabled={
              !nuevaVisita.clienteId ||
              !nuevaVisita.motivoVisita ||
              !nuevaVisita.tipoVisita
            }
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Iniciar Visita
          </Button>
        )}
      </CardFooter>
      <Dialog open={openCloseVisita} onOpenChange={setOpenCloseVisita}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <AlertTriangle className="inline-block mr-2 text-red-500" />
              Confirmar Cancelación
            </DialogTitle>
            <DialogDescription>
              Por favor, proporciona una razón para cancelar la visita.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="text"
            placeholder="Motivo de cancelación"
            value={observacionesClose}
            onChange={(e) => setObservacionesClose(e.target.value)}
            disabled={truncarClose}
          />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpenCloseVisita(false)}
              disabled={truncarClose}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={cancelarVisita}
              disabled={truncarClose || !observacionesClose.trim()}
            >
              {truncarClose ? "Cancelando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirmFinish} onOpenChange={setOpenConfirmFinish}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-xl font-semibold text-primary">
              <AlertTriangle className="w-6 h-6 mr-2 text-warning" />
              Confirmar Finalización de Visita
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas finalizar esta visita?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              variant="destructive"
              onClick={() => setOpenConfirmFinish(false)}
              className="w-full "
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={finalizarVisita}
              disabled={isSubmitting}
              className="w-full  bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Finalizando...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Finalizar Visita
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

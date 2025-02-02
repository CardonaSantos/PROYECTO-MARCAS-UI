import { useStore } from "@/Context/ContextSucursal";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface SaldosInterface {
  empresaId: number | null;
  saldoActual: number | null;
  ingresosTotales: number | null;
  egresosTotales: number | null;
  numeroVentas: number | null;
}

export interface IEmpresa {
  id: number;
  nombre: string;
  telefono: string;
  pbx?: string;
  direccion: string;
  email: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) {
    // covers both null and undefined
    return "N/A";
  }
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);
}

function Saldos() {
  const empresaId = useStore((state) => state.sucursalId) ?? 0;

  const [saldos, setSaldos] = useState<SaldosInterface | null>(null);
  const [empresaINFO, setEmpresaINFO] = useState<IEmpresa | null>(null);

  const [isLoadingEmpresa, setIsLoadingEmpresa] = useState(true);
  const [isLoadingSaldos, setIsLoadingSaldos] = useState(true);

  // Obtener información de la empresa
  useEffect(() => {
    if (empresaId) {
      const getInfoEmpresa = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/empresa/get-empresa-info/${empresaId}`
          );
          if (response.status == 200 || response.status == 201) {
            setEmpresaINFO(response.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Error al conseguir información de la empresa");
        } finally {
          setIsLoadingEmpresa(false); // Termina la carga
        }
      };
      getInfoEmpresa();
    }
  }, [empresaId]);

  // Obtener información de los saldos
  useEffect(() => {
    if (empresaId) {
      const getSaldos = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/saldos/init-saldos/${empresaId}`
          );
          if (response.status == 200 || response.status == 201) {
            setSaldos(response.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Error al conseguir los datos de saldos");
        } finally {
          setIsLoadingSaldos(false); // Termina la carga
        }
      };
      getSaldos();
    }
  }, [empresaId]);

  // Mostrar solo cuando ambos estados hayan terminado de cargar
  if (isLoadingEmpresa || isLoadingSaldos) {
    return <div className="p-4">Cargando datos...</div>;
  }

  // Mostrar error si no se obtuvieron datos válidos
  if (!empresaINFO || !saldos) {
    return (
      <div className="p-4">
        <div>Error al cargar los datos. Por favor, intente nuevamente.</div>
      </div>
    );
  }

  // Renderización principal
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {empresaINFO.nombre || "Empresa"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{empresaINFO.telefono || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{empresaINFO.email || "N/A"}</span>
            </div>
            {empresaINFO.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span>{empresaINFO.website}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(saldos.saldoActual)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(saldos.ingresosTotales)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Egresos Totales
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(saldos.egresosTotales)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Número de Ventas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {saldos.numeroVentas || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Saldos;

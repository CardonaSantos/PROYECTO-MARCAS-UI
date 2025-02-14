import { useStore } from "@/Context/ContextSucursal";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    description: string;
  }

  function StatCard({ title, value, icon, description }: StatCardProps) {
    return (
      <Card className="overflow-hidden transition-all hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    );
  }

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
    <div className="p-4 space-y-6">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="font-bold">{empresaINFO.nombre || "Empresa"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      {empresaINFO.telefono || "N/A"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Teléfono de contacto</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      {empresaINFO.email || "N/A"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Correo electrónico</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {empresaINFO.website && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10 transition-colors">
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="text-sm">{empresaINFO.website}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sitio web</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Actual"
          value={formatCurrency(saldos.saldoActual)}
          icon={<Wallet className="h-6 w-6" />}
          description="Balance actual de la empresa"
        />
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(saldos.ingresosTotales)}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Total de ingresos recibidos"
        />
        <StatCard
          title="Egresos Totales"
          value={formatCurrency(saldos.egresosTotales)}
          icon={<TrendingDown className="h-6 w-6" />}
          description="Total de gastos realizados"
        />
        <StatCard
          title="Número de Ventas"
          value={saldos.numeroVentas || "N/A"}
          icon={<ShoppingCart className="h-6 w-6" />}
          description="Cantidad total de ventas"
        />
      </div>
    </div>
  );
}

export default Saldos;

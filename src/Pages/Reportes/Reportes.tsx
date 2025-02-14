import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import {
  Download,
  CalendarIcon,
  Users,
  Package,
  Coins,
  Compass,
  Target,
  PackagePlus,
  Calendar,
  CreditCard,
  UserIcon,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
import SelectComponent from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
registerLocale("es", es);

import axios from "axios";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
//

// Define interfaces
interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  dateRange: DateRange;
  onDateChange: (field: "startDate" | "endDate", date: Date | null) => void;
  onDownload: () => void;
  children?: React.ReactNode;
  startDatePlaceholder?: string; // Placeholder para la fecha de inicio
  endDatePlaceholder?: string; // Placeholder para la fecha de fin
}

function ReportCard({
  title,
  icon,
  description,
  dateRange,
  onDateChange,
  onDownload,
  children,
  startDatePlaceholder = "Seleccionar fecha de inicio", // Valor por defecto
  endDatePlaceholder = "Seleccionar fecha de fin", // Valor por defecto
}: ReportCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de Inicio */}
          <div className="space-y-2">
            <label
              htmlFor={`start-date-${title}`}
              className="text-sm font-medium"
            >
              Fecha
            </label>
            <div className="relative">
              <DatePicker
                id={`start-date-${title}`}
                selected={dateRange.startDate}
                onChange={(date) => onDateChange("startDate", date)}
                selectsStart
                isClearable={true}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText={startDatePlaceholder} // Usar la prop
                className="text-sm w-full px-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>
          {/* Fecha de Fin */}
          <div className="space-y-2">
            <label
              htmlFor={`end-date-${title}`}
              className="text-sm font-medium"
            >
              Fecha
            </label>
            <div className="relative">
              <DatePicker
                id={`end-date-${title}`}
                selected={dateRange.endDate}
                onChange={(date) => onDateChange("endDate", date)}
                selectsEnd
                isClearable={true}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                minDate={dateRange.startDate}
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText={endDatePlaceholder} // Usar la prop
                className="text-sm w-full px-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 " />
            </div>
          </div>
        </div>
        {children}
        <Button onClick={onDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Descargar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Reportes Component
function Reportes() {
  const [ventasDateRange, setVentasDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [clientesDateRange, setClientesDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [prospectosDateRange, setProspectosDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [visitasDateRange, setVisitasDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [inventarioDateRange, setInventarioDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [entregasDateRange, setEntregasDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [asistenciasDateRange, setAsistenciaDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [creditosDateRange, setCreditosDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [usuariosDateRange, setUsuariosDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [salesMinTotal, setSalesMinTotal] = useState<string>("");
  const [salesMaxTotal, setSalesMaxTotal] = useState<string>(""); // Nuevo estado

  const handleDateChange = (
    reportType: string,
    field: "startDate" | "endDate",
    date: Date | null
  ) => {
    switch (reportType) {
      case "ventas":
        setVentasDateRange((prev) => ({ ...prev, [field]: date }));
        break;
      case "clientes":
        setClientesDateRange((prev) => ({ ...prev, [field]: date }));
        break;
      case "prospectos":
        setProspectosDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "visitas":
        setVisitasDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "inventario":
        setInventarioDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "entregas":
        setEntregasDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "asistencias":
        setAsistenciaDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "creditos":
        setCreditosDateRange((prev) => ({ ...prev, [field]: date }));
        break;

      case "usuarios":
        setUsuariosDateRange((prev) => ({ ...prev, [field]: date }));
        break;
    }
  };

  console.log("inicio de ventas: ", ventasDateRange.startDate);
  console.log("fin de ventas: ", ventasDateRange.endDate);

  const handleDownload = async (
    type: string,
    dateRange: DateRange,
    additionalParams = {}
  ) => {
    try {
      const params = {
        from: dateRange?.startDate?.toISOString(),
        to: dateRange?.endDate?.toISOString(),
        useDiscounted: useDiscounted,
        ...additionalParams,
      };

      const response = await axios.get(`${API_URL}/reports/${type}/excel`, {
        params,
        responseType: "blob", // Necesario para descargar archivos
      });

      // Crear enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-reporte.xlsx`);
      document.body.appendChild(link);
      link.click();

      toast.success(`El reporte de ${type} ha sido descargado exitosamente.`);
    } catch (error) {
      console.error(`Error al descargar el reporte de ${type}:`, error);
      toast.error("Error al descargar el reporte.");
    }
  };

  const [useDiscounted, setUseDiscounted] = useState(false);
  const [minCompras, setMinCompras] = useState<string>(""); // Número mínimo de compras
  const [maxCompras, setMaxCompras] = useState<string>(""); // Número máximo de compras

  const [minGastado, setMinGastado] = useState<string>(""); // Monto mínimo gastado
  const [maxGastado, setMaxGastado] = useState<string>(""); // Monto máximo gastado

  interface Municipio {
    label: string;
    value: string;
  }

  interface Departamento {
    label: string;
    value: string;
    municipios: Municipio[];
  }
  const [selectedDepartamento, setSelectedDepartamento] =
    useState<Departamento | null>(null);
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(
    null
  );

  type EstadoProspecto = "CERRADO" | "FINALIZADO";

  type EstadoVisita = "FINALIZADA" | "CANCELADA";

  interface EstadoOption {
    value: EstadoProspecto;
    label: string;
  }

  interface EstadoOptionVisita {
    value: EstadoVisita;
    label: string;
  }

  type MotivoVisita =
    | "COMPRA_CLIENTE"
    | "PRESENTACION_PRODUCTOS"
    | "NEGOCIACION_PRECIOS"
    | "ENTREGA_MUESTRAS"
    | "PLANIFICACION_PEDIDOS"
    | "CONSULTA_CLIENTE"
    | "SEGUIMIENTO"
    | "PROMOCION"
    | "OTRO";

  const [estadoProspecto, setEstadoProspecto] = useState<EstadoOption | null>(
    null
  );

  const [estadoVisita, setEstadoVisita] = useState<EstadoOptionVisita | null>(
    null
  );

  const [motivoVisita, setMotivoVisita] = useState<{
    value: MotivoVisita;
    label: string;
  } | null>(null);

  interface Category extends Categoria {
    id: number;
    creadoEn: string;
    actualizadoEn: string;
  }

  interface Categoria {
    nombre: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);

  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categories/get-all-categories`
      );
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const categoryOptions = categories.map((category) => ({
    value: category.nombre,
    label: category.nombre,
  }));

  const [selectedCategory, setSelectedCategory] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [minStock, setMinStock] = useState<number | string>("");
  const [maxStock, setMaxStock] = useState<number | string>("");
  const [minPrice, setMinPrice] = useState<number | string>("");
  const [maxPrice, setMaxPrice] = useState<number | string>("");

  const handleDepartamentoChange = (selectedOption: Departamento | null) => {
    setSelectedDepartamento(selectedOption);
    setFilteredMunicipios(selectedOption ? selectedOption.municipios : []);
    setSelectedMunicipio(null); // Resetear el municipio seleccionado
  };

  const handleMunicipioChange = (selectedOption: Municipio | null) => {
    setSelectedMunicipio(selectedOption);
  };

  const departamentos2: Departamento[] = [
    {
      label: "Guatemala",
      value: "Guatemala",
      municipios: [
        { label: "Ciudad de Guatemala", value: "Ciudad de Guatemala" },
        { label: "Santa Catarina Pinula", value: "Santa Catarina Pinula" },
        { label: "San José Pinula", value: "San José Pinula" },
        { label: "San José del Golfo", value: "San José del Golfo" },
        { label: "Palencia", value: "Palencia" },
        { label: "Chinautla", value: "Chinautla" },
        { label: "San Pedro Ayampuc", value: "San Pedro Ayampuc" },
        { label: "Mixco", value: "Mixco" },
        { label: "San Pedro Sacatepéquez", value: "San Pedro Sacatepéquez" },
        { label: "San Juan Sacatepéquez", value: "San Juan Sacatepéquez" },
        { label: "San Raymundo", value: "San Raymundo" },
        { label: "Chuarrancho", value: "Chuarrancho" },
        { label: "Fraijanes", value: "Fraijanes" },
        { label: "Amatitlán", value: "Amatitlán" },
        { label: "Villa Nueva", value: "Villa Nueva" },
        { label: "Villa Canales", value: "Villa Canales" },
        { label: "San Miguel Petapa", value: "San Miguel Petapa" },
      ],
    },
    {
      label: "Sacatepéquez",
      value: "Sacatepéquez",
      municipios: [
        { label: "Antigua Guatemala", value: "Antigua Guatemala" },
        { label: "Jocotenango", value: "Jocotenango" },
        { label: "Pastores", value: "Pastores" },
        { label: "Sumpango", value: "Sumpango" },
        { label: "Santo Domingo Xenacoj", value: "Santo Domingo Xenacoj" },
        { label: "Santiago Sacatepéquez", value: "Santiago Sacatepéquez" },
        {
          label: "San Bartolomé Milpas Altas",
          value: "San Bartolomé Milpas Altas",
        },
        { label: "San Lucas Sacatepéquez", value: "San Lucas Sacatepéquez" },
        {
          label: "Santa Lucía Milpas Altas",
          value: "Santa Lucía Milpas Altas",
        },
        { label: "Magdalena Milpas Altas", value: "Magdalena Milpas Altas" },
        { label: "Santa María de Jesús", value: "Santa María de Jesús" },
        { label: "Ciudad Vieja", value: "Ciudad Vieja" },
        {
          label: "San Antonio Aguas Calientes",
          value: "San Antonio Aguas Calientes",
        },
        { label: "Santa Catarina Barahona", value: "Santa Catarina Barahona" },
      ],
    },

    {
      label: "Chimaltenango",
      value: "Chimaltenango",
      municipios: [
        { label: "Chimaltenango", value: "Chimaltenango" },
        { label: "San José Poaquil", value: "San José Poaquil" },
        { label: "San Martín Jilotepeque", value: "San Martín Jilotepeque" },
        { label: "Comalapa", value: "Comalapa" },
        { label: "Santa Apolonia", value: "Santa Apolonia" },
        { label: "Tecpán Guatemala", value: "Tecpán Guatemala" },
        { label: "Patzún", value: "Patzún" },
        { label: "Pochuta", value: "Pochuta" },
        { label: "Patzicía", value: "Patzicía" },
        { label: "Santa Cruz Balanyá", value: "Santa Cruz Balanyá" },
        { label: "Acatenango", value: "Acatenango" },
        { label: "Yepocapa", value: "Yepocapa" },
        { label: "San Andrés Itzapa", value: "San Andrés Itzapa" },
        { label: "Parramos", value: "Parramos" },
        { label: "Zaragoza", value: "Zaragoza" },
        { label: "El Tejar", value: "El Tejar" },
      ],
    },

    {
      label: "Escuintla",
      value: "Escuintla",
      municipios: [
        { label: "Escuintla", value: "Escuintla" },
        {
          label: "Santa Lucía Cotzumalguapa",
          value: "Santa Lucía Cotzumalguapa",
        },
        { label: "La Democracia", value: "La Democracia" },
        { label: "Siquinalá", value: "Siquinalá" },
        { label: "Masagua", value: "Masagua" },
        { label: "Tiquisate", value: "Tiquisate" },
        { label: "La Gomera", value: "La Gomera" },
        { label: "Guanagazapa", value: "Guanagazapa" },
        { label: "San José", value: "San José" },
        { label: "Iztapa", value: "Iztapa" },
        { label: "Palín", value: "Palín" },
        { label: "San Vicente Pacaya", value: "San Vicente Pacaya" },
        { label: "Nueva Concepción", value: "Nueva Concepción" },
      ],
    },

    {
      label: "Santa Rosa",
      value: "Santa Rosa",
      municipios: [
        { label: "Cuilapa", value: "Cuilapa" },
        { label: "Barberena", value: "Barberena" },
        { label: "Santa Rosa de Lima", value: "Santa Rosa de Lima" },
        { label: "Casillas", value: "Casillas" },
        { label: "San Rafael Las Flores", value: "San Rafael Las Flores" },
        { label: "Oratorio", value: "Oratorio" },
        { label: "San Juan Tecuaco", value: "San Juan Tecuaco" },
        { label: "Chiquimulilla", value: "Chiquimulilla" },
        { label: "Taxisco", value: "Taxisco" },
        { label: "Santa María Ixhuatán", value: "Santa María Ixhuatán" },
        { label: "Guazacapán", value: "Guazacapán" },
        { label: "Santa Cruz Naranjo", value: "Santa Cruz Naranjo" },
        { label: "Pueblo Nuevo Viñas", value: "Pueblo Nuevo Viñas" },
        { label: "Nueva Santa Rosa", value: "Nueva Santa Rosa" },
      ],
    },
    {
      label: "Sololá",
      value: "Sololá",
      municipios: [
        { label: "Sololá", value: "Sololá" },
        { label: "San José Chacayá", value: "San José Chacayá" },
        { label: "Santa María Visitación", value: "Santa María Visitación" },
        { label: "Santa Lucía Utatlán", value: "Santa Lucía Utatlán" },
        { label: "Nahualá", value: "Nahualá" },
        {
          label: "Santa Catarina Ixtahuacán",
          value: "Santa Catarina Ixtahuacán",
        },
        { label: "Santa Clara La Laguna", value: "Santa Clara La Laguna" },
        { label: "Concepción", value: "Concepción" },
        { label: "San Andrés Semetabaj", value: "San Andrés Semetabaj" },
        { label: "Panajachel", value: "Panajachel" },
        { label: "San Antonio Palopó", value: "San Antonio Palopó" },
        { label: "San Lucas Tolimán", value: "San Lucas Tolimán" },
        { label: "Santa Cruz La Laguna", value: "Santa Cruz La Laguna" },
        { label: "San Pablo La Laguna", value: "San Pablo La Laguna" },
        { label: "San Marcos La Laguna", value: "San Marcos La Laguna" },
        { label: "San Juan La Laguna", value: "San Juan La Laguna" },
        { label: "San Pedro La Laguna", value: "San Pedro La Laguna" },
        { label: "Santiago Atitlán", value: "Santiago Atitlán" },
      ],
    },

    {
      label: "Totonicapán",
      value: "Totonicapán",
      municipios: [
        { label: "Totonicapán", value: "Totonicapán" },
        {
          label: "San Cristóbal Totonicapán",
          value: "San Cristóbal Totonicapán",
        },
        { label: "San Francisco El Alto", value: "San Francisco El Alto" },
        { label: "San Andrés Xecul", value: "San Andrés Xecul" },
        { label: "Momostenango", value: "Momostenango" },
        { label: "Santa María Chiquimula", value: "Santa María Chiquimula" },
        { label: "Santa Lucía La Reforma", value: "Santa Lucía La Reforma" },
        { label: "San Bartolo", value: "San Bartolo" },
      ],
    },

    {
      label: "Quetzaltenango",
      value: "Quetzaltenango",
      municipios: [
        { label: "Quetzaltenango", value: "Quetzaltenango" },
        { label: "Salcajá", value: "Salcajá" },
        { label: "Olintepeque", value: "Olintepeque" },
        { label: "San Carlos Sija", value: "San Carlos Sija" },
        { label: "Sibilia", value: "Sibilia" },
        { label: "Cabricán", value: "Cabricán" },
        { label: "Cajolá", value: "Cajolá" },
        { label: "San Miguel Sigüilá", value: "San Miguel Sigüilá" },
        { label: "Ostuncalco", value: "Ostuncalco" },
        { label: "San Mateo", value: "San Mateo" },
        {
          label: "Concepción Chiquirichapa",
          value: "Concepción Chiquirichapa",
        },
        { label: "San Martín Sacatepéquez", value: "San Martín Sacatepéquez" },
        { label: "Almolonga", value: "Almolonga" },
        { label: "Cantel", value: "Cantel" },
        { label: "Huitán", value: "Huitán" },
        { label: "Zunil", value: "Zunil" },
        { label: "Colomba", value: "Colomba" },
        { label: "San Francisco La Unión", value: "San Francisco La Unión" },
        { label: "El Palmar", value: "El Palmar" },
        { label: "Coatepeque", value: "Coatepeque" },
        { label: "Génova", value: "Génova" },
        { label: "Flores Costa Cuca", value: "Flores Costa Cuca" },
        { label: "La Esperanza", value: "La Esperanza" },
        { label: "Palestina de Los Altos", value: "Palestina de Los Altos" },
      ],
    },
    {
      label: "Suchitepéquez",
      value: "Suchitepéquez",
      municipios: [
        { label: "Mazatenango", value: "Mazatenango" },
        { label: "Cuyotenango", value: "Cuyotenango" },
        {
          label: "San Francisco Zapotitlán",
          value: "San Francisco Zapotitlán",
        },
        { label: "San Bernardino", value: "San Bernardino" },
        { label: "San José El Ídolo", value: "San José El Ídolo" },
        {
          label: "Santo Domingo Suchitepéquez",
          value: "Santo Domingo Suchitepéquez",
        },
        { label: "San Lorenzo", value: "San Lorenzo" },
        { label: "Samayac", value: "Samayac" },
        { label: "San Pablo Jocopilas", value: "San Pablo Jocopilas" },
        {
          label: "San Antonio Suchitepéquez",
          value: "San Antonio Suchitepéquez",
        },
        { label: "San Miguel Panán", value: "San Miguel Panán" },
        { label: "San Gabriel", value: "San Gabriel" },
        { label: "Chicacao", value: "Chicacao" },
        { label: "Patulul", value: "Patulul" },
        { label: "Santa Bárbara", value: "Santa Bárbara" },
        { label: "San Juan Bautista", value: "San Juan Bautista" },
        { label: "Santo Domingo", value: "Santo Domingo" },
        { label: "Zunilito", value: "Zunilito" },
        { label: "Pueblo Nuevo", value: "Pueblo Nuevo" },
        { label: "Río Bravo", value: "Río Bravo" },
      ],
    },

    {
      label: "San Marcos",
      value: "San Marcos",
      municipios: [
        { label: "San Marcos", value: "San Marcos" },
        { label: "San Pedro Sacatepéquez", value: "San Pedro Sacatepéquez" },
        {
          label: "San Antonio Sacatepéquez",
          value: "San Antonio Sacatepéquez",
        },
        { label: "Comitancillo", value: "Comitancillo" },
        { label: "San Miguel Ixtahuacán", value: "San Miguel Ixtahuacán" },
        { label: "Concepción Tutuapa", value: "Concepción Tutuapa" },
        { label: "Tacaná", value: "Tacaná" },
        { label: "Sibinal", value: "Sibinal" },
        { label: "Tajumulco", value: "Tajumulco" },
        { label: "Tejutla", value: "Tejutla" },
        {
          label: "San Rafael Pie de la Cuesta",
          value: "San Rafael Pie de la Cuesta",
        },
        { label: "Nuevo Progreso", value: "Nuevo Progreso" },
        { label: "El Tumbador", value: "El Tumbador" },
        { label: "El Rodeo", value: "El Rodeo" },
        { label: "Malacatán", value: "Malacatán" },
        { label: "Catarina", value: "Catarina" },
        { label: "Ayutla", value: "Ayutla" },
        { label: "Ocos", value: "Ocos" },
        { label: "San Pablo", value: "San Pablo" },
        { label: "El Quetzal", value: "El Quetzal" },
        { label: "La Reforma", value: "La Reforma" },
        { label: "Pajapita", value: "Pajapita" },
        { label: "Ixchiguán", value: "Ixchiguán" },
        { label: "San José Ojetenam", value: "San José Ojetenam" },
        { label: "San Cristóbal Cucho", value: "San Cristóbal Cucho" },
        { label: "Sipacapa", value: "Sipacapa" },
        { label: "Esquipulas Palo Gordo", value: "Esquipulas Palo Gordo" },
        { label: "Río Blanco", value: "Río Blanco" },
        { label: "San Lorenzo", value: "San Lorenzo" },
      ],
    },

    {
      label: "Huehuetenango",
      value: "Huehuetenango",
      municipios: [
        { label: "Huehuetenango", value: "Huehuetenango" },
        { label: "Chiantla", value: "Chiantla" },
        { label: "Malacatancito", value: "Malacatancito" },
        { label: "Cuilco", value: "Cuilco" },
        { label: "Nentón", value: "Nentón" },
        { label: "San Pedro Necta", value: "San Pedro Necta" },
        { label: "Jacaltenango", value: "Jacaltenango" },
        { label: "Soloma", value: "Soloma" },
        { label: "Ixtahuacán", value: "Ixtahuacán" },
        { label: "Santa Bárbara", value: "Santa Bárbara" },
        { label: "La Libertad", value: "La Libertad" },
        { label: "La Democracia", value: "La Democracia" },
        { label: "San Miguel Acatán", value: "San Miguel Acatán" },
        {
          label: "San Rafael La Independencia",
          value: "San Rafael La Independencia",
        },
        { label: "Todos Santos Cuchumatán", value: "Todos Santos Cuchumatán" },
        { label: "San Juan Atitán", value: "San Juan Atitán" },
        { label: "Santa Eulalia", value: "Santa Eulalia" },
        { label: "San Mateo Ixtatán", value: "San Mateo Ixtatán" },
        { label: "Colotenango", value: "Colotenango" },
        {
          label: "San Sebastián Huehuetenango",
          value: "San Sebastián Huehuetenango",
        },
        { label: "Tectitán", value: "Tectitán" },
        { label: "Concepción Huista", value: "Concepción Huista" },
        { label: "San Juan Ixcoy", value: "San Juan Ixcoy" },
        { label: "San Antonio Huista", value: "San Antonio Huista" },
        { label: "San Sebastián Coatan", value: "San Sebastián Coatan" },
        { label: "Santa Cruz Barillas", value: "Santa Cruz Barillas" },
        { label: "Aguacatán", value: "Aguacatán" },
        { label: "San Rafael Petzal", value: "San Rafael Petzal" },
        { label: "San Gaspar Ixchil", value: "San Gaspar Ixchil" },
        { label: "Santiago Chimaltenango", value: "Santiago Chimaltenango" },
        { label: "Santa Ana Huista", value: "Santa Ana Huista" },
      ],
    },

    {
      label: "Quiché",
      value: "Quiché",
      municipios: [
        { label: "Santa Cruz del Quiché", value: "Santa Cruz del Quiché" },
        { label: "Chiche", value: "Chiche" },
        { label: "Chinique", value: "Chinique" },
        { label: "Zacualpa", value: "Zacualpa" },
        { label: "Chajul", value: "Chajul" },
        { label: "Chichicastenango", value: "Chichicastenango" },
        { label: "Patzité", value: "Patzité" },
        { label: "San Antonio Ilotenango", value: "San Antonio Ilotenango" },
        { label: "San Pedro Jocopilas", value: "San Pedro Jocopilas" },
        { label: "Cunén", value: "Cunén" },
        { label: "San Juan Cotzal", value: "San Juan Cotzal" },
        { label: "Joyabaj", value: "Joyabaj" },
        { label: "Nebaj", value: "Nebaj" },
        { label: "San Andrés Sajcabajá", value: "San Andrés Sajcabajá" },
        { label: "Uspantán", value: "Uspantán" },
        { label: "Sacapulas", value: "Sacapulas" },
        {
          label: "San Bartolomé Jocotenango",
          value: "San Bartolomé Jocotenango",
        },
        { label: "Canillá", value: "Canillá" },
        { label: "Chicamán", value: "Chicamán" },
        { label: "Ixcán", value: "Ixcán" },
        { label: "Pachalum", value: "Pachalum" },
      ],
    },

    {
      label: "Baja Verapaz",
      value: "Baja Verapaz",
      municipios: [
        { label: "Salamá", value: "Salamá" },
        { label: "San Miguel Chicaj", value: "San Miguel Chicaj" },
        { label: "Rabinal", value: "Rabinal" },
        { label: "Cubulco", value: "Cubulco" },
        { label: "Granados", value: "Granados" },
        { label: "Santa Cruz El Chol", value: "Santa Cruz El Chol" },
        { label: "San Jerónimo", value: "San Jerónimo" },
        { label: "Purulhá", value: "Purulhá" },
      ],
    },

    {
      label: "Alta Verapaz",
      value: "Alta Verapaz",
      municipios: [
        { label: "Cobán", value: "Cobán" },
        { label: "Santa Cruz Verapaz", value: "Santa Cruz Verapaz" },
        { label: "San Cristóbal Verapaz", value: "San Cristóbal Verapaz" },
        { label: "Tactic", value: "Tactic" },
        { label: "Tamahú", value: "Tamahú" },
        { label: "San Miguel Tucurú", value: "San Miguel Tucurú" },
        { label: "Panzós", value: "Panzós" },
        { label: "Senahú", value: "Senahú" },
        { label: "San Pedro Carchá", value: "San Pedro Carchá" },
        { label: "Santa María Cahabón", value: "Santa María Cahabón" },
        { label: "Chisec", value: "Chisec" },
        { label: "Chahal", value: "Chahal" },
        {
          label: "Fray Bartolomé de las Casas",
          value: "Fray Bartolomé de las Casas",
        },
        { label: "La Tinta", value: "La Tinta" },
      ],
    },

    {
      label: "Petén",
      value: "Petén",
      municipios: [
        { label: "Flores", value: "Flores" },
        { label: "San José", value: "San José" },
        { label: "San Benito", value: "San Benito" },
        { label: "San Andrés", value: "San Andrés" },
        { label: "La Libertad", value: "La Libertad" },
        { label: "San Francisco", value: "San Francisco" },
        { label: "Santa Ana", value: "Santa Ana" },
        { label: "Dolores", value: "Dolores" },
        { label: "San Luis", value: "San Luis" },
        { label: "Sayaxché", value: "Sayaxché" },
        { label: "Melchor de Mencos", value: "Melchor de Mencos" },
        { label: "Poptún", value: "Poptún" },
      ],
    },

    {
      label: "Izabal",
      value: "Izabal",
      municipios: [
        { label: "Puerto Barrios", value: "Puerto Barrios" },
        { label: "Livingston", value: "Livingston" },
        { label: "El Estor", value: "El Estor" },
        { label: "Morales", value: "Morales" },
        { label: "Los Amates", value: "Los Amates" },
      ],
    },

    {
      label: "Zacapa",
      value: "Zacapa",
      municipios: [
        { label: "Zacapa", value: "Zacapa" },
        { label: "Estanzuela", value: "Estanzuela" },
        { label: "Río Hondo", value: "Río Hondo" },
        { label: "Gualán", value: "Gualán" },
        { label: "Teculután", value: "Teculután" },
        { label: "Usumatlán", value: "Usumatlán" },
        { label: "Cabañas", value: "Cabañas" },
        { label: "San Diego", value: "San Diego" },
        { label: "La Unión", value: "La Unión" },
        { label: "Huité", value: "Huité" },
      ],
    },

    {
      label: "Chiquimula",
      value: "Chiquimula",
      municipios: [
        { label: "Chiquimula", value: "Chiquimula" },
        { label: "San José La Arada", value: "San José La Arada" },
        { label: "San Juan Ermita", value: "San Juan Ermita" },
        { label: "Jocotán", value: "Jocotán" },
        { label: "Camotán", value: "Camotán" },
        { label: "Olopa", value: "Olopa" },
        { label: "Esquipulas", value: "Esquipulas" },
        { label: "Concepción Las Minas", value: "Concepción Las Minas" },
        { label: "Quezaltepeque", value: "Quezaltepeque" },
        { label: "San Jacinto", value: "San Jacinto" },
        { label: "Ipala", value: "Ipala" },
      ],
    },

    {
      label: "Jalapa",
      value: "Jalapa",
      municipios: [
        { label: "Jalapa", value: "Jalapa" },
        { label: "San Pedro Pinula", value: "San Pedro Pinula" },
        { label: "San Luis Jilotepeque", value: "San Luis Jilotepeque" },
        { label: "San Manuel Chaparrón", value: "San Manuel Chaparrón" },
        { label: "San Carlos Alzatate", value: "San Carlos Alzatate" },
        { label: "Monjas", value: "Monjas" },
        { label: "Mataquescuintla", value: "Mataquescuintla" },
      ],
    },

    {
      label: "Jutiapa",
      value: "Jutiapa",
      municipios: [
        { label: "Jutiapa", value: "Jutiapa" },
        { label: "El Progreso", value: "El Progreso" },
        { label: "Santa Catarina Mita", value: "Santa Catarina Mita" },
        { label: "Agua Blanca", value: "Agua Blanca" },
        { label: "Asunción Mita", value: "Asunción Mita" },
        { label: "Yupiltepeque", value: "Yupiltepeque" },
        { label: "Atescatempa", value: "Atescatempa" },
        { label: "Jerez", value: "Jerez" },
        { label: "El Adelanto", value: "El Adelanto" },
        { label: "Zapotitlán", value: "Zapotitlán" },
        { label: "Comapa", value: "Comapa" },
        { label: "Jalpatagua", value: "Jalpatagua" },
        { label: "Conguaco", value: "Conguaco" },
        { label: "Moyuta", value: "Moyuta" },
        { label: "Pasaco", value: "Pasaco" },
        { label: "San José Acatempa", value: "San José Acatempa" },
        { label: "Quezada", value: "Quezada" },
      ],
    },
    {
      label: "El Progreso",
      value: "El Progreso",
      municipios: [
        { label: "Guastatoya", value: "Guastatoya" },
        { label: "Morazán", value: "Morazán" },
        {
          label: "San Agustín Acasaguastlán",
          value: "San Agustín Acasaguastlán",
        },
        {
          label: "San Cristóbal Acasaguastlán",
          value: "San Cristóbal Acasaguastlán",
        },
        { label: "El Jícaro", value: "El Jícaro" },
        { label: "Sansare", value: "Sansare" },
        { label: "Sanarate", value: "Sanarate" },
        { label: "San Antonio La Paz", value: "San Antonio La Paz" },
      ],
    },
  ];

  console.log("el departamento seleccionado es: ", selectedDepartamento?.value);

  console.log("el municipio seleccionado es: ", selectedMunicipio?.value);

  const [proveedores, setProveedores] = useState<Provider[]>([]);

  interface Provider {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    direccion: string;
    razonSocial: string;
    rfc: string;
    nombreContacto: string;
    telefonoContacto: string;
    emailContacto: string;
    pais: string;
    ciudad: string;
    codigoPostal: string;
    notas: string;
    latitud: number;
    longitud: number;
  }
  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/provider`);
      setProveedores(response.data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los proveedores");
    }
  };

  const [selectedProveedor, setSelectedProveedor] = useState<{
    value: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CONSEGUIR REPORTES DE LAS VENTAS */}
        <ReportCard
          title="Ventas"
          icon={<Coins className="h-6 w-6" />}
          description="Reporte de ventas con filtro por rango de fechas y montos"
          dateRange={ventasDateRange}
          onDateChange={(field, date) =>
            handleDateChange("ventas", field, date)
          }
          onDownload={() =>
            handleDownload("ventas", ventasDateRange, {
              minTotal: salesMinTotal,
              maxTotal: salesMaxTotal,
            })
          }
        >
          <div className="space-y-2">
            <label htmlFor="sales-min-total" className="text-sm font-medium">
              Costo Total Mínimo
            </label>
            <Input
              id="sales-min-total"
              type="number"
              placeholder="Ingrese el costo total mínimo"
              value={salesMinTotal}
              onChange={(e) => setSalesMinTotal(e.target.value)}
            />
            <label htmlFor="sales-max-total" className="text-sm font-medium">
              Costo Total Máximo
            </label>
            <Input
              id="sales-max-total"
              type="number"
              placeholder="Ingrese el costo total máximo"
              value={salesMaxTotal}
              onChange={(e) => setSalesMaxTotal(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-discounted"
                onCheckedChange={(checked: boolean) =>
                  setUseDiscounted(checked)
                }
                checked={useDiscounted}
              />
              <label htmlFor="use-discounted" className="text-sm font-medium">
                Filtrar por monto con descuento
              </label>
            </div>
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTES DE LAS VENTAS */}

        {/* CONSEGUIR REPORTES DE LOS CLIENTES */}
        <ReportCard
          title="Clientes"
          icon={<Users className="h-6 w-6" />}
          description="Reporte de clientes con filtros avanzados"
          dateRange={clientesDateRange}
          onDateChange={(field, date) =>
            handleDateChange("clientes", field, date)
          }
          onDownload={() =>
            handleDownload("clientes", clientesDateRange, {
              minCompras,
              maxCompras,
              minGastado,
              maxGastado,
              municipio: selectedMunicipio?.value,
              departamento: selectedDepartamento?.value,
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Mínimo de Compras"
              value={minCompras}
              onChange={(e) => setMinCompras(e.target.value)}
            />
            <Input
              placeholder="Máximo de Compras"
              value={maxCompras}
              onChange={(e) => setMaxCompras(e.target.value)}
            />
            <Input
              placeholder="Monto Mínimo Gastado"
              value={minGastado}
              onChange={(e) => setMinGastado(e.target.value)}
            />
            <Input
              placeholder="Monto Máximo Gastado"
              value={maxGastado}
              onChange={(e) => setMaxGastado(e.target.value)}
            />

            <div className="">
              <label className="text-sm font-medium text-black">
                Departamento
              </label>
              <SelectComponent
                className="w-full text-black"
                options={departamentos2} // Opciones de departamentos
                value={selectedDepartamento}
                onChange={handleDepartamentoChange}
                placeholder="Seleccione un Departamento"
                isClearable
              />
            </div>

            <div className="">
              <label className="text-sm font-medium text-black">
                Municipio
              </label>
              <SelectComponent
                className="w-full text-black"
                options={filteredMunicipios} // Opciones de municipios filtradas
                value={selectedMunicipio}
                onChange={handleMunicipioChange}
                placeholder="Seleccione un Municipio"
                isClearable
                isDisabled={!selectedDepartamento} // Deshabilitar si no hay departamento seleccionado
              />
            </div>
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTES DE LOS CLIENTES */}

        {/* CONSEGUIR REPORTE DE INENTARIO */}
        <ReportCard
          title="Inventario"
          icon={<Package className="h-6 w-6" />}
          description="Reporte de inventario"
          dateRange={inventarioDateRange}
          onDateChange={(field, date) =>
            handleDateChange("inventario", field, date)
          }
          onDownload={() =>
            handleDownload("inventario", inventarioDateRange, {
              minStock,
              maxStock,
              minPrice,
              maxPrice,
              categoria: selectedCategory?.value,
            })
          }
          startDatePlaceholder="Inicio del rango de creació"
          endDatePlaceholder="Fin del rango de creación"
        >
          {/* Select para Categorías */}
          <div className="mb-4">
            <label className="text-sm font-medium text-black">Categoría</label>
            <SelectComponent
              className="w-full text-black"
              options={categoryOptions}
              value={selectedCategory}
              onChange={(selectedOption) => setSelectedCategory(selectedOption)}
              placeholder="Seleccione una categoría"
              isClearable
            />
          </div>

          {/* Inputs para filtros de Stock */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className="text-sm font-medium text-black
              dark:text-white
              "
              >
                Stock Mínimo
              </label>
              <Input
                type="number"
                className="w-full "
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="Ingrese stock mínimo"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-black
              dark:text-white
              "
              >
                Stock Máximo
              </label>
              <Input
                type="number"
                className="w-full "
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                placeholder="Ingrese stock máximo"
              />
            </div>
          </div>

          {/* Inputs para filtros de Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black dark:text-white">
                Precio Mínimo
              </label>
              <Input
                type="number"
                className="w-full "
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Ingrese precio mínimo"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-black
              dark:text-white
              "
              >
                Precio Máximo
              </label>
              <Input
                type="number"
                className="w-full "
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Ingrese precio máximo"
              />
            </div>
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTE DE INENTARIO */}

        {/* CONSEGUIR REPORTES DE REGISTROS DE ENTREGA */}
        <ReportCard
          title="Historial de Entregas"
          icon={<PackagePlus className="h-6 w-6" />} // Icono ideal para entregas
          description="Reporte de historial de entregas de stock"
          dateRange={entregasDateRange}
          onDateChange={(field, date) =>
            handleDateChange("entregas", field, date)
          }
          onDownload={() =>
            handleDownload("entregas", entregasDateRange, {
              proveedor: selectedProveedor?.value, // Filtro de proveedor
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Proveedor</label>
            <SelectComponent
              className="w-full text-black"
              options={proveedores.map((proveedor) => ({
                value: proveedor.id,
                label: proveedor.nombre,
              }))}
              value={selectedProveedor}
              onChange={(selectedOption) =>
                setSelectedProveedor(selectedOption)
              }
              placeholder="Seleccione un proveedor"
              isClearable
            />
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTES DE REGISTROS DE ENTREGA */}

        {/* CONSEGUIR REPORTES DE CREDITOS */}
        <ReportCard
          title="Creditos"
          icon={<CreditCard className="h-6 w-6" />} // Icono ideal para entregas
          description="Reporte de historial de Asistencias"
          dateRange={creditosDateRange}
          onDateChange={(field, date) =>
            handleDateChange("creditos", field, date)
          }
          onDownload={() =>
            handleDownload("creditos", creditosDateRange, {
              proveedor: selectedProveedor?.value, // Filtro de proveedor
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        ></ReportCard>
        {/* CONSEGUIR REPORTES DE CREDITOS */}

        {/* CONSEGUIR REPORTES DE PROSPECTOS */}
        <ReportCard
          title="Prospectos"
          icon={<Target className="h-6 w-6" />}
          description="Reporte de registro de prospectos"
          dateRange={prospectosDateRange}
          onDateChange={(field, date) =>
            handleDateChange("prospectos", field, date)
          }
          onDownload={() =>
            handleDownload("prospectos", prospectosDateRange, {
              estado: estadoProspecto?.value,
              motivo: motivoVisita?.value,
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        >
          <div className="">
            <label className="text-sm font-medium text-black">
              Estado del Prospecto
            </label>
            <SelectComponent
              className="w-full text-black"
              options={[
                { value: "FINALIZADO", label: "FINALIZADOS" },
                { value: "CERRADO", label: "CANCELADOS" },
              ]} // Opciones de estados
              value={estadoProspecto}
              onChange={(selectedOption) => {
                setEstadoProspecto(selectedOption);
              }}
              placeholder="Seleccione un Estado"
              isClearable
            />
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTES DE PROSPECTOS */}

        {/* CONSEGUIR REPORTES DE VISITAS */}
        <ReportCard
          title="Visitas"
          icon={<Compass className="h-6 w-6" />}
          description="Reporte de registro de visitas"
          dateRange={visitasDateRange}
          onDateChange={(field, date) =>
            handleDateChange("visitas", field, date)
          }
          onDownload={() =>
            handleDownload("visitas", visitasDateRange, {
              estado: estadoVisita?.value,
              motivo: motivoVisita?.value,
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        >
          <div className="mb-4">
            <label className="text-sm font-medium text-black">
              Estado de la Visita
            </label>
            <SelectComponent
              className="w-full text-black"
              options={[
                { value: "FINALIZADA", label: "FINALIZADA" },
                { value: "CANCELADA", label: "CANCELADA" },
              ]}
              value={estadoVisita}
              onChange={(selectedOption) => setEstadoVisita(selectedOption)}
              placeholder="Seleccione un Estado"
              isClearable
            />
          </div>

          <div className="">
            <label className="text-sm font-medium text-black">
              Motivo de la Visita
            </label>
            <SelectComponent
              className="w-full text-black"
              options={[
                { value: "COMPRA_CLIENTE", label: "Compra Cliente" },
                {
                  value: "PRESENTACION_PRODUCTOS",
                  label: "Presentación de Productos",
                },
                {
                  value: "NEGOCIACION_PRECIOS",
                  label: "Negociación de Precios",
                },
                { value: "ENTREGA_MUESTRAS", label: "Entrega de Muestras" },
                {
                  value: "PLANIFICACION_PEDIDOS",
                  label: "Planificación de Pedidos",
                },
                { value: "CONSULTA_CLIENTE", label: "Consulta Cliente" },
                { value: "SEGUIMIENTO", label: "Seguimiento" },
                { value: "PROMOCION", label: "Promoción" },
                { value: "OTRO", label: "Otro" },
              ]}
              value={motivoVisita}
              onChange={(selectedOption) => setMotivoVisita(selectedOption)}
              placeholder="Seleccione un Motivo"
              isClearable
            />
          </div>
        </ReportCard>
        {/* CONSEGUIR REPORTES DE VISITAS */}

        {/* CONSEGUIR REPORTE DE ASISTENCIAS */}
        <ReportCard
          title="Asistencias"
          icon={<Calendar className="h-6 w-6" />} // Icono ideal para entregas
          description="Reporte de historial de Asistencias"
          dateRange={asistenciasDateRange}
          onDateChange={(field, date) =>
            handleDateChange("asistencias", field, date)
          }
          onDownload={() =>
            handleDownload("asistencias", asistenciasDateRange, {
              proveedor: selectedProveedor?.value, // Filtro de proveedor
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        ></ReportCard>
        {/* CONSEGUIR REPORTE DE ASISTENCIAS */}

        {/* CONSEGUIR REPORTES DE USUARIOS */}
        <ReportCard
          title="Usuarios"
          icon={<UserIcon className="h-6 w-6" />} // Icono ideal para entregas
          description="Reporte de usuarios"
          dateRange={usuariosDateRange}
          onDateChange={(field, date) =>
            handleDateChange("creditos", field, date)
          }
          onDownload={() =>
            handleDownload("usuarios", usuariosDateRange, {
              proveedor: selectedProveedor?.value, // Filtro de proveedor
            })
          }
          startDatePlaceholder="Inicio del rango de creación"
          endDatePlaceholder="Fin del rango de creación"
        ></ReportCard>
        {/* CONSEGUIR REPORTES DE USUARIOS */}
      </div>
    </div>
  );
}

export default Reportes;

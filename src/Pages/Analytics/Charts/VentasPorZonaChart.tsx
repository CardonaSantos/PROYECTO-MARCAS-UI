import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const API_URL = import.meta.env.VITE_API_URL;

// Definimos la interfaz para los datos de la zona
interface ZonaData {
  zona: string;
  cantidadVentas: number;
}

function VentasPorZonaChart() {
  const [dataZonas, setDataZonas] = useState<ZonaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Función para obtener los datos del backend
    const fetchData = async () => {
      try {
        const response = await axios.get<ZonaData[]>(
          `${API_URL}/analytics/get-ventas-por-zona`
        );
        setDataZonas(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Configuración del gráfico
  const chartData = {
    labels: dataZonas.map((item) => item.zona), // Etiquetas del eje Y (zonas)
    datasets: [
      {
        label: "Cantidad de Ventas",
        data: dataZonas.map((item) => item.cantidadVentas), // Datos del eje X
        backgroundColor: "rgba(54, 162, 235, 0.8)", // Azul claro
        borderColor: "rgba(54, 162, 235, 1)", // Azul oscuro
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    indexAxis: "y" as const, // Cambiar el eje a horizontal
    plugins: {
      legend: {
        display: false, // Ocultar la leyenda
      },
      title: {
        display: true,
        text: "Cantidad de Ventas por Zona",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Cantidad de Ventas",
        },
      },
      y: {
        title: {
          display: true,
          text: "Zona",
        },
      },
    },
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default VentasPorZonaChart;

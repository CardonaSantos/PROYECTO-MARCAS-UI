import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
const API_URL = import.meta.env.VITE_API_URL;

// Registrar elementos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TiempoMedioVisita {
  semana: string;
  duracionPromedio: number;
}

function TiempoMedioVisitasChart() {
  const [dataVisitas, setDataVisitas] = useState<TiempoMedioVisita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/get-average-visit-time`
        );
        setDataVisitas(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching average visit time data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Configuración de datos para el gráfico
  const chartData = {
    labels: dataVisitas.map((item) => item.semana), // Semanas
    datasets: [
      {
        label: "Duración Media (horas)",
        data: dataVisitas.map((item) => item.duracionPromedio),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4, // Suavizado de línea
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Tiempo Medio de Visitas (por semana)",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Semanas",
        },
      },
      y: {
        title: {
          display: true,
          text: "Horas Promedio",
        },
      },
    },
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default TiempoMedioVisitasChart;

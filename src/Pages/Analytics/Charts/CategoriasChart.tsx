import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
const API_URL = import.meta.env.VITE_API_URL;

// Registrar los componentes de Chart.js
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

// Interfaz para los datos recibidos del servidor
interface CategoriaData {
  categoria: string;
  totalCantidad: number;
  totalDinero: number;
}

function CategoriasChart() {
  const [dataCategorias, setDataCategorias] = useState<CategoriaData[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Función para obtener los datos del servidor
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/get-ventas-por-categoria`
        );
        setDataCategorias(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Configuración del gráfico
  const chartData = {
    labels: Array.isArray(dataCategorias)
      ? dataCategorias.map((item) => item.categoria)
      : [],
    datasets: [
      {
        label: "Unidades Vendidas",
        data: Array.isArray(dataCategorias)
          ? dataCategorias.map((item) => item.totalCantidad)
          : [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Ingresos Generados (Q)",
        data: Array.isArray(dataCategorias)
          ? dataCategorias.map((item) => item.totalDinero)
          : [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Ventas por Categoría: Unidades y Ingresos",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Categorías",
        },
      },
      y: {
        title: {
          display: true,
          text: "Valores",
        },
      },
    },
  };

  console.log("los datos del char son: ", dataCategorias);

  return (
    <div className="p-4">
      {isLoading ? (
        <p>Cargando datos...</p>
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  );
}

export default CategoriasChart;

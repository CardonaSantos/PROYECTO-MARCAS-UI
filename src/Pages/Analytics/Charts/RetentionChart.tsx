import React, { useEffect, useState } from "react";
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
const API_URL = import.meta.env.VITE_API_URL;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RetentionData {
  periodo: string; // Mes (formato YYYY-MM)
  nuevos: number; // Nuevos clientes
  recurrentes: number; // Clientes recurrentes
}

const RetentionChart: React.FC = () => {
  const [retentionData, setRetentionData] = useState<RetentionData[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRetentionData = async () => {
      try {
        const response = await axios.get<RetentionData[]>(
          `${API_URL}/analytics/get-retention-data`
        );
        setRetentionData(response.data);
      } catch (error) {
        console.error("Error fetching retention data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionData();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!retentionData) {
    return <p>No se pudieron cargar los datos de retención.</p>;
  }

  // Configuración del gráfico
  const chartData = {
    labels: retentionData.map((entry) => entry.periodo),
    datasets: [
      {
        label: "Nuevos Clientes",
        data: retentionData.map((entry) => entry.nuevos),
        backgroundColor: "rgba(54, 162, 235, 0.5)", // Azul claro
        borderColor: "rgba(54, 162, 235, 1)", // Azul oscuro
        borderWidth: 1,
      },
      {
        label: "Clientes Recurrentes",
        data: retentionData.map((entry) => entry.recurrentes),
        backgroundColor: "rgba(255, 99, 132, 0.5)", // Rojo claro
        borderColor: "rgba(255, 99, 132, 1)", // Rojo oscuro
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
        text: "Retención de Clientes (Nuevos vs Recurrentes)",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Meses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cantidad de Clientes",
        },
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default RetentionChart;

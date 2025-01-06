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

interface ProspectoEstadoData {
  estado: string;
  cantidad: number;
}

const ProspectosEstadosChart: React.FC = () => {
  const [dataEstados, setDataEstados] = useState<ProspectoEstadoData[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProspectosEstados = async () => {
      try {
        const response = await axios.get<ProspectoEstadoData[]>(
          `${API_URL}/analytics/get-prospectos-por-estado`
        );
        setDataEstados(response.data);
      } catch (error) {
        console.error("Error fetching prospectos estados data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProspectosEstados();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!dataEstados) {
    return <p>No se pudieron cargar los datos de prospectos.</p>;
  }

  // Configuración del gráfico
  const chartData = {
    labels: dataEstados.map((item) =>
      item.estado === "FINALIZADO" ? "Finalizado" : "Cerrado"
    ),
    datasets: [
      {
        label: "Estados de Prospectos",
        data: dataEstados.map((item) => item.cantidad),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)", // Azul para finalizado
          "rgba(255, 99, 132, 0.8)", // Rojo para cerrado
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)", // Azul oscuro
          "rgba(255, 99, 132, 1)", // Rojo oscuro
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Estados de Prospectos",
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProspectosEstadosChart;

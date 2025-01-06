import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const VisitasPorMesChart = () => {
  const [dataChartLine, setDataChartLine] = useState<any>(null);

  useEffect(() => {
    const fetchVisitasPorMes = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/get-visitas-mes`
        );
        const visitasPorMes = response.data;

        // Formatear datos para Chart.js
        const chartData = {
          labels: visitasPorMes.map((v: any) => v.periodo),
          datasets: [
            {
              label: "Visitas Realizadas",
              data: visitasPorMes.map((v: any) => v.visitas),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3,
              fill: true,
            },
          ],
        };

        setDataChartLine(chartData);
      } catch (error) {
        console.error("Error al obtener visitas por mes:", error);
      }
    };

    fetchVisitasPorMes();
  }, []);

  const optionsLineChart = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Visitas Realizadas por Mes",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Mes",
        },
      },
      y: {
        title: {
          display: true,
          text: "Número de Visitas",
        },
      },
    },
  };

  return (
    <div>
      {dataChartLine ? (
        <Line data={dataChartLine} options={optionsLineChart} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default VisitasPorMesChart;

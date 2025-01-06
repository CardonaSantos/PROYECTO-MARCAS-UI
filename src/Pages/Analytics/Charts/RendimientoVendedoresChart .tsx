import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
const API_URL = import.meta.env.VITE_API_URL;
import axios from "axios";

const RendimientoVendedoresChart = () => {
  const [dataChartBarVendedores, setDataChartBarVendedores] =
    useState<any>(null);

  useEffect(() => {
    const fetchRendimientoVendedores = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/get-rendimiento-vendedores`
        );
        const vendedoresRendimiento = response.data;

        // Formatear los datos para Chart.js
        const chartData = {
          labels: vendedoresRendimiento.map((v: any) => v.nombre),
          datasets: [
            {
              label: "Ventas Realizadas",
              data: vendedoresRendimiento.map((v: any) => v.ventas),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
            {
              label: "Ingresos Generados (Q)",
              data: vendedoresRendimiento.map((v: any) => v.ingresos),
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        };

        setDataChartBarVendedores(chartData);
      } catch (error) {
        console.error("Error al obtener rendimiento de vendedores:", error);
      }
    };

    fetchRendimientoVendedores();
  }, []);

  const optionsBarVendedores = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vendedores con Mejor Rendimiento",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Vendedores",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cantidad (Ventas / Ingresos)",
        },
      },
    },
  };

  console.log("DATA RENDIMIENTO: ", dataChartBarVendedores);

  return (
    <div>
      {dataChartBarVendedores ? (
        <Bar data={dataChartBarVendedores} options={optionsBarVendedores} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default RendimientoVendedoresChart;

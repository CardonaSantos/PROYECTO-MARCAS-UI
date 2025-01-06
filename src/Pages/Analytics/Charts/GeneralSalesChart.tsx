import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

export type SalesMonthYear = {
  mes: string;
  totalVentas: number;
  ventasTotales: number;
};

ChartJS.register(PointElement, LineElement, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL;

function GeneralSalesChart() {
  const [salesMonthYear, setSalesMonthYear] = useState<SalesMonthYear[]>([]);

  //------------DATA PARA EL CHART--------------
  const labels = salesMonthYear.map((data) => data.mes);
  const totalVentasData = salesMonthYear.map((data) => data.totalVentas);
  const ventasTotalesData = salesMonthYear.map((data) => data.ventasTotales);

  const dataChart = {
    labels: labels,
    datasets: [
      {
        label: "Total Ventas",
        data: totalVentasData,
        borderColor: "rgba(255, 99, 132, 1)", // Color rojo
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Transparente del mismo color
        fill: true,
      },
      {
        label: "Número de Ventas",
        data: ventasTotalesData,
        borderColor: "rgba(54, 162, 235, 1)", // Color azul
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Transparente del mismo color
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Esto le dice a TypeScript que el valor es exactamente 'top'
      },
      title: {
        display: true,
        text: "Ventas Mensuales",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesmonthyearResponse] = await Promise.all([
          fetch(`${API_URL}/analytics/get-total-month-monto`), //total ventas por mes del año
        ]);

        const salesmonthy = await salesmonthyearResponse.json();

        setSalesMonthYear(salesmonthy);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Line className="w-full h-full" data={dataChart} options={options} />
    </div>
  );
}

export default GeneralSalesChart;

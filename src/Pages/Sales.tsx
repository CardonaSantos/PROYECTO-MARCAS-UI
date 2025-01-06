import { useEffect, useState } from "react";

import axios from "axios";
import { toast } from "sonner";
import { SalesType } from "../Utils/Types/Sales";
import TableSale from "../components/Tables/TableSale";
const API_URL = import.meta.env.VITE_API_URL;
function Sales() {
  const [sales, setSales] = useState<SalesType | null>(null);

  const getSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sale`);
      if (response.status === 200) {
        setSales(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No hay ventas disponibles para ver");
    }
  };

  useEffect(() => {
    getSales();
  }, []);

  console.log(sales);

  if (!sales || sales.length <= 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-center">
          No hay ventas disponibles
        </h2>
      </div>
    );
  }

  return (
    <>
      <TableSale sales={sales} />
    </>
  );
}

export default Sales;

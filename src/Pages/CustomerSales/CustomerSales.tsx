import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SalesType } from "@/Utils/Types/Sales";
import { jwtDecode } from "jwt-decode";
import SalesCustomerTable from "./SalesCustomerTable";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerSales() {
  const { id: clienteId } = useParams<{ id: string }>(); // Obtener el clienteId de la URL

  interface UserTokenInfo {
    nombre: string;
    // apellido: string;
    correo: string;
    rol: string;
    sub: number;
    activo: boolean;
  }

  const [tokenUser, setTokenUser] = useState<UserTokenInfo | null>(null);
  const [sales, setSales] = useState<SalesType | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const getSales = async () => {
      if (!tokenUser) return; // Asegurarse de que el tokenUser esté disponible antes de hacer la llamada

      try {
        const response = await axios.get(
          `${API_URL}/sale/customer-sales/${clienteId}`
        );
        if (response.status === 200) {
          setSales(response.data);
        } else {
          toast.info("No hay ventas disponibles para ver");
        }
      } catch (error) {
        console.log(error);
        toast.info("No hay ventas disponibles para ver");
      }
    };

    getSales();
  }, [tokenUser]);

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
      <SalesCustomerTable sales={sales} />
    </>
  );
}

export default CustomerSales;

import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { VentaTypePDF } from "./VentaType";
import VentaPDF from "./VentaPDF";

const API_URL = import.meta.env.VITE_API_URL;

interface Empresa {
  id?: number;
  nombre: string;
  telefono: string;
  pbx?: string;
  direccion: string;
  email: string;
  website?: string;
}

function VentaPdfPage() {
  // Obtén el parámetro idSale de la URL
  const { id } = useParams(); // Extrae el valor de idSale
  console.log("El id del param es: ", id);

  const [venta, setVenta] = useState<VentaTypePDF>();

  const getSale = async () => {
    try {
      // Asegúrate de concatenar correctamente el idSale a la URL
      const response = await axios.get(`${API_URL}/sale/get-sale-to-pdf/${id}`);
      if (response.status === 200) {
        setVenta(response.data);
      }
    } catch (error) {
      console.log("Error al conseguir el registro de venta");
      toast.error("Error al encontrar registro de venta");
    }
  };
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: "",
    telefono: "",
    pbx: "",
    direccion: "",
    email: "",
    website: "",
  });
  const fetchEmpresa = async () => {
    try {
      const response = await axios.get(`${API_URL}/empresa/verify-empresa`);
      if (response.status === 200) {
        setEmpresa(response.data);
      }
    } catch (error) {
      console.error("Error fetching empresa:", error);
      toast.error("No se pudo cargar la información de la empresa.");
    }
  };

  useEffect(() => {
    fetchEmpresa();
  }, []);

  console.log("La info de la empresa para el comprobante es: ", empresa);

  useEffect(() => {
    getSale();
  }, [id]); // Escucha por cambios en idSale

  console.log("El reguistro de cuota pagada es: ", venta);

  return (
    <div>
      {venta && venta ? (
        <PDFViewer width="100%" height="600">
          <VentaPDF venta={venta} empresa={empresa} />
        </PDFViewer>
      ) : (
        <p className="text-center font-extrabold text-xl">Cargando PDF...</p>
      )}
    </div>
  );
}
export default VentaPdfPage;

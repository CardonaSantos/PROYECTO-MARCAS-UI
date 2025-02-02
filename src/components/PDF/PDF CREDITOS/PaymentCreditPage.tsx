import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import PDFpayment from "./PDFpayment";

const API_URL = import.meta.env.VITE_API_URL;

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
}

interface Empresa {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  pbx: string | null;
  email: string;
  website: string | null;
}

interface Credito {
  id: number;
  montoTotalConInteres: number;
  saldoPendiente: number;
  totalPagado: number;
  numeroCuotas: number;
  interes: number; // Porcentaje de interés
  fechaContrato: string; // ISO 8601 formatted date
  cliente: Cliente;
  empresa: Empresa;
}

interface CreditoPago {
  id: number;
  creditoId: number;
  monto: number;
  timestamp: string; // ISO 8601 formatted date
  metodoPago: string; // e.g., "CONTADO", "TARJETA"
  credito: Credito;
}

function PaymentCreditPage() {
  const { id } = useParams();

  const [credito, setCredito] = useState<CreditoPago>();

  const getCredit = async () => {
    try {
      // Asegúrate de concatenar correctamente el idSale a la URL
      const response = await axios.get(
        `${API_URL}/credito/get-one-payment/${id}`
      );
      if (response.status === 200) {
        setCredito(response.data);
      }
    } catch (error) {
      console.log("Error al conseguir el registro de venta");
      toast.error("Error al encontrar registro de venta");
    }
  };

  useEffect(() => {
    getCredit();
  }, [id]); // Escucha por cambios en idSale

  return (
    <div>
      {credito && credito ? (
        <PDFViewer width="100%" height="600">
          <PDFpayment credito={credito} />
        </PDFViewer>
      ) : (
        <p className="text-center font-extrabold text-xl">Cargando PDF...</p>
      )}
    </div>
  );
}
export default PaymentCreditPage;

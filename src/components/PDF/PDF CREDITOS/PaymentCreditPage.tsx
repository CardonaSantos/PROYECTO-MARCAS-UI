import { PDFViewer, pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import PDFpayment from "./PDFpayment";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";

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
  interes: number;
  fechaContrato: string;
  cliente: Cliente;
  empresa: Empresa;
}

interface CreditoPago {
  id: number;
  creditoId: number;
  monto: number;
  timestamp: string;
  metodoPago: string;
  credito: Credito;
}

function PaymentCreditPage() {
  const { id } = useParams();
  const [credito, setCredito] = useState<CreditoPago>();
  const [isMobile, setIsMobile] = useState(false);

  const isMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA =
      /android|iphone|ipad|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(
        userAgent
      );
    const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
    return isMobileUA || isTouchScreen;
  };

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const getCredit = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/credito/get-one-payment/${id}`
      );
      if (response.status === 200) {
        setCredito(response.data);
      }
    } catch (error) {
      console.log("Error al conseguir el registro de pago");
      toast.error("Error al encontrar registro de pago");
    }
  };

  useEffect(() => {
    getCredit();
  }, [id]);

  const downloadPDF = async () => {
    if (!credito) return;

    const blob = await pdf(<PDFpayment credito={credito} />).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Pago_Credito_${credito.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {credito ? (
        isMobile ? (
          <div className="text-center">
            <Button onClick={downloadPDF} className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Descargar PDF de pago
            </Button>
            <p className="mt-2 text-sm text-gray-600">
              La vista previa no está disponible en dispositivos móviles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Vista previa del pago de crédito
              </h2>
              <Button onClick={downloadPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <PDFViewer width="100%" height="600" className="w-full">
                <PDFpayment credito={credito} />
              </PDFViewer>
            </div>
          </div>
        )
      ) : (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-md">
          <Eye className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-lg font-medium">
            No se ha podido cargar el PDF de pago
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Por favor, verifique la información del crédito e intente
            nuevamente.
          </p>
        </div>
      )}
    </div>
  );
}

export default PaymentCreditPage;

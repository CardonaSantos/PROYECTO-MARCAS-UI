import { PDFViewer, pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { VentaTypePDF } from "./VentaType";
import VentaPDF from "./VentaPDF";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";

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
  const { id } = useParams();
  const [venta, setVenta] = useState<VentaTypePDF>();
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: "",
    telefono: "",
    pbx: "",
    direccion: "",
    email: "",
    website: "",
  });

  // ✅ Detectar si es un móvil o tablet
  const isMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA =
      /android|iphone|ipad|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(
        userAgent
      );
    const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

    return isMobileUA || isTouchScreen;
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const getSale = async () => {
    try {
      const response = await axios.get(`${API_URL}/sale/get-sale-to-pdf/${id}`);
      if (response.status === 200) {
        setVenta(response.data);
      }
    } catch (error) {
      console.log("Error al conseguir el registro de venta");
      toast.error("Error al encontrar registro de venta");
    }
  };

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

  useEffect(() => {
    getSale();
  }, [id]);

  // Función para generar y descargar el PDF
  const downloadPDF = async () => {
    if (!venta) return;

    const blob = await pdf(
      <VentaPDF venta={venta} empresa={empresa} />
    ).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Factura_${venta.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {venta ? (
        isMobile ? (
          <div className="text-center">
            <Button onClick={downloadPDF} className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
            <p className="mt-2 text-sm text-gray-600">
              La vista previa no está disponible en dispositivos móviles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vista previa de la factura</h2>
              <Button onClick={downloadPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <PDFViewer width="100%" height="600" className="w-full">
                <VentaPDF venta={venta} empresa={empresa} />
              </PDFViewer>
            </div>
          </div>
        )
      ) : (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-md">
          <Eye className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-lg font-medium">
            No se ha podido cargar la factura
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Por favor, verifique la información e intente nuevamente.
          </p>
        </div>
      )}
    </div>
  );
}

export default VentaPdfPage;

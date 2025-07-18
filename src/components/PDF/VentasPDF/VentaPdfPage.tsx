"use client";

import { PDFViewer, pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Note: This is from react-router-dom, not Next.js's useParams
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, FileDown, Printer, ReceiptText } from "lucide-react";
import VentaPDF, { type VentaTypePDF } from "./VentaPDF";
import VentaThermalPDF from "./VentaThermalPDF";

// Note: API_URL is accessed via import.meta.env, typical for Vite projects, not standard Next.js (process.env.NEXT_PUBLIC_API_URL)
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
  const [printType, setPrintType] = useState<"A4" | "thermal">("A4"); // Nuevo estado para el tipo de impresión

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
  const downloadPDF = async (type: "A4" | "thermal") => {
    if (!venta) return;
    const PDFComponent = type === "A4" ? VentaPDF : VentaThermalPDF;
    const filename =
      type === "A4"
        ? `Factura_${venta.id}.pdf`
        : `Recibo_Termico_${venta.id}.pdf`;
    const blob = await pdf(
      <PDFComponent venta={venta} empresa={empresa} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {venta ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h2 className="text-2xl font-bold text-center sm:text-left">
              Vista previa de la factura
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {/* Botones en línea, compactos */}
              <Button
                onClick={() => setPrintType("A4")}
                variant={printType === "A4" ? "default" : "outline"}
                className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
              >
                <Printer className="h-4 w-4" />
                Vista A4
              </Button>
              <Button
                onClick={() => setPrintType("thermal")}
                variant={printType === "thermal" ? "default" : "outline"}
                className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
              >
                <ReceiptText className="h-4 w-4" />
                Vista Térmica
              </Button>
              <Button
                onClick={() => downloadPDF("A4")}
                className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Descargar A4
              </Button>
              <Button
                onClick={() => downloadPDF("thermal")}
                className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Descargar Térmico
              </Button>
            </div>
          </div>

          {isMobile ? (
            <div className="text-center p-4 bg-blue-100 border border-blue-300 rounded-md">
              <p className="mt-2 text-sm text-gray-600">
                La vista previa no está disponible en dispositivos móviles. Por
                favor, usa los botones de descarga.
              </p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md overflow-hidden flex justify-center items-center min-h-[600px]">
              <PDFViewer
                width={printType === "A4" ? "100%" : "300px"} // Ajustado el ancho para la vista térmica
                height="600px"
              >
                {printType === "A4" ? (
                  <VentaPDF venta={venta} empresa={empresa} />
                ) : (
                  <VentaThermalPDF venta={venta} empresa={empresa} />
                )}
              </PDFViewer>
            </div>
          )}
        </>
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

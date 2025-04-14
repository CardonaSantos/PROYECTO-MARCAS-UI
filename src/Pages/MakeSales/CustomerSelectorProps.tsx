import SelectComponent from "react-select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Percent, FileText } from "lucide-react";
import { Cliente, Descuento } from "./types";

interface CustomerSelectorProps {
  customers: Cliente[];
  selectedCustomer: Cliente | null;
  setSelectedCustomer: (cliente: Cliente | null) => void;
  selectedDiscount: Descuento | null;
  setSelectedDiscount: (descuento: Descuento | null) => void;
  descuento: number | undefined;
  setDescuento: (val: number) => void;
  nota: string;
  setNota: (val: string) => void;
  selectedMetodPago: string;
  registroAbierto: any;
  requestCustomDiscount: () => void;
}

export default function CustomerSelector({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  selectedDiscount,
  setSelectedDiscount,
  descuento,
  setDescuento,
  nota,
  setNota,
  selectedMetodPago,
  registroAbierto,
  requestCustomDiscount,
}: CustomerSelectorProps) {
  const options = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.nombre} ${customer.apellido || ""}`,
  }));

  const opcionesDescuento = selectedCustomer?.descuentos.map((desc) => ({
    value: desc.id,
    label: `${desc.porcentaje.toString()}`,
  }));

  return (
    <div className="w-full p-4">
      <Card className="mb-8 shadow-xl">
        <CardContent>
          <h3 className="text-md font-semibold mb-4 pt-2">
            Selección de Cliente
          </h3>
          <SelectComponent
            options={options}
            isClearable={true}
            isDisabled={!!registroAbierto}
            value={
              registroAbierto
                ? {
                    value: registroAbierto.cliente.id,
                    label: `${registroAbierto.cliente.nombre} ${
                      registroAbierto.cliente.apellido || ""
                    }`,
                  }
                : selectedCustomer
                ? {
                    value: selectedCustomer.id,
                    label: `${selectedCustomer.nombre} ${
                      selectedCustomer.apellido || ""
                    }`,
                  }
                : null
            }
            onChange={(selectedOption) => {
              if (!registroAbierto) {
                if (selectedOption === null) {
                  setSelectedCustomer(null);
                } else {
                  const selected =
                    customers.find((c) => c.id === selectedOption.value) ||
                    null;
                  setSelectedCustomer(selected);
                }
              }
            }}
            placeholder="Seleccionar cliente..."
            noOptionsMessage={() => "No se encontró el cliente."}
            isSearchable
            className="text-black"
          />

          {selectedCustomer && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Descuentos disponibles:</h3>
              <SelectComponent
                options={opcionesDescuento || []}
                isClearable={true}
                value={
                  selectedDiscount
                    ? {
                        value: selectedDiscount.id,
                        label: `${selectedDiscount.porcentaje}%`,
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (selectedOption === null) {
                    setSelectedDiscount(null);
                  } else {
                    const discount = selectedCustomer?.descuentos.find(
                      (desc) => desc.id === selectedOption.value
                    );
                    setSelectedDiscount(discount || null);
                  }
                }}
                placeholder="Seleccionar descuento"
                noOptionsMessage={() => "No hay descuentos disponibles"}
                isSearchable
                className="text-black"
                isDisabled={selectedMetodPago === "CREDITO"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Percent className="w-5 h-5" /> Solicitar Descuento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Porcentaje"
                min="0"
                max="100"
                value={descuento || ""}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="pl-8 pr-4 py-2 w-full"
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                %
              </span>
            </div>
          </div>
          <div className="relative">
            <Textarea
              placeholder="Justificación del descuento"
              onChange={(e) => setNota(e.target.value)}
              value={nota}
              className="pl-10 resize-none"
              rows={4}
            />
            <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={requestCustomDiscount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            Solicitar Descuento Personalizado
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

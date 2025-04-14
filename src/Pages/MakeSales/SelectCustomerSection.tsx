import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Percent, FileText } from "lucide-react";
import SelectComponent from "react-select";
import { Cliente, Descuento, Visita2 } from "./types";

interface Props {
  registroAbierto: Visita2 | null;
  selectedCustomer: Cliente | null;
  setSelectedCustomer: (cliente: Cliente | null) => void;
  customers: Cliente[];
  selectedDiscount: Descuento | null;
  setSelectedDiscount: (d: Descuento | null) => void;
  selectedMetodPago: string;
  descuento: number | undefined;
  setDescuento: (v: number) => void;
  nota: string;
  setNota: (v: string) => void;
  requestCustomDiscount: () => void;
}

export default function SelectCustomerSection({
  registroAbierto,
  selectedCustomer,
  setSelectedCustomer,
  customers,
  selectedDiscount,
  setSelectedDiscount,
  selectedMetodPago,
  descuento,
  setDescuento,
  nota,
  setNota,
  requestCustomDiscount,
}: Props) {
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
                  const selected = customers.find(
                    (customer) => customer.id === selectedOption.value
                  );
                  setSelectedCustomer(selected || null);
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
                isDisabled={selectedMetodPago === "CREDITO"}
                className="text-black"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Solicitar Descuento Personalizado
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

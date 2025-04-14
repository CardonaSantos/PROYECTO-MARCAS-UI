import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Percent } from "lucide-react";
import SelectComponent from "react-select";

import type { Cliente, Descuento } from "./types";

interface CustomerSelectorProps {
  selectedCustomer: Cliente | null;
  setSelectedCustomer: (cliente: Cliente | null) => void;
  customers: Cliente[];
  selectedDiscount: Descuento | null;
  setSelectedDiscount: (desc: Descuento | null) => void;
  descuento: number | undefined;
  setDescuento: (d: number) => void;
  nota: string;
  setNota: (n: string) => void;
  registroAbierto: { cliente: Cliente } | null;
  requestCustomDiscount: () => void;
}

export default function CustomerSelector({
  selectedCustomer,
  setSelectedCustomer,
  customers,
  selectedDiscount,
  setSelectedDiscount,
  descuento,
  setDescuento,
  nota,
  setNota,
  registroAbierto,
  requestCustomDiscount,
}: CustomerSelectorProps) {
  const options = customers.map((c) => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido || ""}`.trim(),
  }));

  const opcionesDescuento =
    selectedCustomer?.descuentos.map((desc) => ({
      value: desc.id,
      label: `${desc.porcentaje}%`,
    })) || [];

  return (
    <div className="w-full p-4">
      <div className="mb-8 shadow-xl border rounded-lg">
        <div className="p-4">
          <h3 className="text-md font-semibold mb-4 pt-2">
            Selección de Cliente
          </h3>

          <SelectComponent
            options={options}
            isClearable
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
            onChange={(
              selectedOption: { value: number; label: string } | null
            ) => {
              if (!registroAbierto) {
                const cliente =
                  customers.find((c) => c.id === selectedOption?.value) || null;
                setSelectedCustomer(cliente);
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
                options={opcionesDescuento}
                isClearable
                value={
                  selectedDiscount
                    ? {
                        value: selectedDiscount.id,
                        label: `${selectedDiscount.porcentaje}%`,
                      }
                    : null
                }
                onChange={(
                  selectedOption: { value: number; label: string } | null
                ) => {
                  const descuento = selectedCustomer.descuentos.find(
                    (d) => d.id === selectedOption?.value
                  );
                  setSelectedDiscount(descuento || null);
                }}
                placeholder="Seleccionar descuento"
                noOptionsMessage={() => "No hay descuentos disponibles"}
                isSearchable
                isDisabled={selectedDiscount?.porcentaje !== undefined}
                className="text-black"
              />
            </div>
          )}
        </div>
      </div>

      <div className="shadow-lg bg-white dark:bg-gray-800 border rounded-lg">
        <div className="p-4">
          <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5" /> Solicitar Descuento
          </h4>

          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Porcentaje"
                min={0}
                max={100}
                value={descuento || ""}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="pl-8 pr-4 py-2 w-full"
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                %
              </span>
            </div>
          </div>

          <div className="relative mb-4">
            <Textarea
              placeholder="Justificación del descuento"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="pl-10 resize-none"
              rows={4}
            />
            <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
          </div>

          <Button
            onClick={requestCustomDiscount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Solicitar Descuento Personalizado
          </Button>
        </div>
      </div>
    </div>
  );
}

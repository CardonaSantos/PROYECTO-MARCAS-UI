import React from "react";
import { CreditCard, Calendar, Coins, Text } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { CreditoInfo } from "./types";

interface Props {
  creditoInfo: CreditoInfo;
  setCreditoInfo: React.Dispatch<React.SetStateAction<CreditoInfo>>;
  fechasDePago: string[];
}

export default function CreditInfoForm({
  creditoInfo,
  setCreditoInfo,
  fechasDePago,
}: Props) {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="mt-8 animate-in fade-in duration-500">
        <h4 className="text-lg font-semibold mb-4 text-center text-primary">
          Información del Crédito
        </h4>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Número de Cuotas
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 12 cuotas"
                value={creditoInfo.numeroCuotas || ""}
                onChange={(e) =>
                  setCreditoInfo((prev) => ({
                    ...prev,
                    numeroCuotas: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Días entre pagos
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 15 (quincenal) 30 (mensual)"
                value={creditoInfo.diasEntrePagos || ""}
                onChange={(e) =>
                  setCreditoInfo((prev) => ({
                    ...prev,
                    diasEntrePagos: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Interés (%)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 10%"
                value={creditoInfo.interes || ""}
                onChange={(e) =>
                  setCreditoInfo((prev) => ({
                    ...prev,
                    interes: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Coins className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Pago Inicial
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 1000"
                value={creditoInfo.creditoInicial || ""}
                onChange={(e) =>
                  setCreditoInfo((prev) => ({
                    ...prev,
                    creditoInicial: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Text className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Comentario
              </label>
              <Textarea
                placeholder="Opcional"
                value={creditoInfo.comentario || ""}
                onChange={(e) =>
                  setCreditoInfo((prev) => ({
                    ...prev,
                    comentario: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Card className="mt-5 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center text-primary">
              <CreditCard className="inline-block mr-2 h-6 w-6" />
              Fechas de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fechasDePago.length <= 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <AlertCircle className="inline-block mr-2 h-4 w-4" />
                Ingrese el número de cuotas y los días entre pagos.
              </p>
            ) : (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <ul className="space-y-2">
                  {fechasDePago.map((fecha, index) => (
                    <li key={index} className="flex items-center">
                      <span className="font-bold mr-2">{index + 1}:</span>
                      <span>{fecha}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

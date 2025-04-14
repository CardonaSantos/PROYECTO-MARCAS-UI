import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Coins, Calendar, Text, AlertCircle } from "lucide-react";
import SummaryItem from "./SummaryItem";

import type { CreditoInfo } from "./types";

interface CreditoInfoFormProps {
  creditoInfo: CreditoInfo;
  setCreditoInfo: (value: CreditoInfo) => void;
  fechasDePago: string[];
  montoTotal: number;
  saldoRestante: number;
  montoInteres: number;
  montoTotalConInteres: number;
  pagoPorCuota: number;
}

export default function CreditoInfoForm({
  creditoInfo,
  setCreditoInfo,
  fechasDePago,
  montoTotal,
  saldoRestante,
  montoInteres,
  montoTotalConInteres,
  pagoPorCuota,
}: CreditoInfoFormProps) {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="w-full mt-8 animate-in fade-in duration-500">
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
                  setCreditoInfo({
                    ...creditoInfo,
                    numeroCuotas: parseInt(e.target.value) || null,
                  })
                }
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
                  setCreditoInfo({
                    ...creditoInfo,
                    diasEntrePagos: parseInt(e.target.value) || null,
                  })
                }
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
                  setCreditoInfo({
                    ...creditoInfo,
                    interes: parseFloat(e.target.value) || null,
                  })
                }
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
                  setCreditoInfo({
                    ...creditoInfo,
                    creditoInicial: parseFloat(e.target.value) || null,
                  })
                }
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
                  setCreditoInfo({
                    ...creditoInfo,
                    comentario: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-5 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center text-primary">
            <CreditCard className="inline-block mr-2 h-6 w-6" />
            Resumen del Crédito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <SummaryItem
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              label="Saldo Restante a Pagar"
              value={saldoRestante}
            />
            <SummaryItem
              icon={<CreditCard className="h-5 w-5 text-green-500" />}
              label="Monto sin interés"
              value={montoTotal}
            />
            <SummaryItem
              icon={<CreditCard className="h-5 w-5 text-yellow-500" />}
              label="Monto de Interés"
              value={montoInteres}
            />
            <SummaryItem
              icon={<CreditCard className="h-5 w-5 text-red-500" />}
              label="Monto Total con Interés"
              value={montoTotalConInteres}
            />
            <SummaryItem
              icon={<CreditCard className="h-5 w-5 text-blue-500" />}
              label="Pago por Cada Cuota"
              value={pagoPorCuota}
            />
          </div>

          <div className="mt-6">
            <h5 className="text-md font-semibold mb-2 flex items-center">
              <Calendar className="inline-block mr-2 h-5 w-5" />
              Fechas de Pago
            </h5>
            {fechasDePago.length === 0 ? (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

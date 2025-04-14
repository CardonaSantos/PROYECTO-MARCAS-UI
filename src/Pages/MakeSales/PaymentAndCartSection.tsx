import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentAndCartSectionProps {
  selectedMetodPago: string;
  setSelectedMetodPago: (value: string) => void;
  cartLength: number;
  setShowCartModal: (value: boolean) => void;
  disableCreditOption: boolean;
}

export default function PaymentAndCartSection({
  selectedMetodPago,
  setSelectedMetodPago,
  cartLength,
  setShowCartModal,
  disableCreditOption,
}: PaymentAndCartSectionProps) {
  return (
    <div className="w-full p-4">
      <div className="mb-1 shadow-xl bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
          Método de Pago
        </h3>

        <Select value={selectedMetodPago} onValueChange={setSelectedMetodPago}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Seleccione método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONTADO">CONTADO</SelectItem>
            <SelectItem value="TARJETA">TARJETA</SelectItem>
            <SelectItem value="TRANSFERENCIA_BANCO">
              TRANSFERENCIA BANCARIA
            </SelectItem>
            <SelectItem value="CREDITO" disabled={disableCreditOption}>
              CRÉDITO
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setShowCartModal(true)}
          className="bg-red-500 w-full text-white"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Ver Carrito ({cartLength})
        </Button>
      </div>
    </div>
  );
}

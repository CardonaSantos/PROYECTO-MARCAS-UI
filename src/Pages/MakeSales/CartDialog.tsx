import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  CreditCard,
  Percent,
  User,
  ShoppingCart,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { Producto, Descuento, Cliente, Visita2 } from "./types";
import { formatearMoneda } from "./utils";

interface CartDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cart: (Producto & { quantity: number })[];
  setCart: React.Dispatch<
    React.SetStateAction<(Producto & { quantity: number })[]>
  >;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  calculateTotal: () => number;
  calculateTotalConDescuento: () => number;
  selectedCustomer: Cliente | null;
  selectedDiscount: Descuento | null;
  selectedMetodPago: string;
  confirmSale: boolean;
  setConfirmSale: (confirm: boolean) => void;
  sendCartData: () => void;
  isSubmitting: boolean;
  registroAbierto: Visita2 | null;
  realizarVentaConVisita: () => void;
}

export default function CartDialog({
  isOpen,
  setIsOpen,
  cart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  calculateTotalConDescuento,
  selectedCustomer,
  selectedDiscount,
  selectedMetodPago,

  sendCartData,
  isSubmitting,
  registroAbierto,
  realizarVentaConVisita,
}: CartDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] h-[90vh] max-h-[800px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Carrito de Compras
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Productos añadidos al carrito
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4 pr-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              El carrito está vacío
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2 sm:mb-0">
                  <img
                    src={item.imagenes[0]?.url || "/placeholder.png"}
                    alt={item.nombre}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md object-cover aspect-square"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {item.nombre}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatearMoneda(item.precio)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max={item.stock?.cantidad}
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      updateQuantity(item.id, value);
                    }}
                    className="w-16 text-center"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <div className="flex-shrink-0 mt-4 space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm">
            <p className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <CreditCard className="w-4 h-4" /> Total:{" "}
              {formatearMoneda(calculateTotal())}
            </p>
            <p className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
              <Percent className="w-4 h-4" /> Total con descuento:{" "}
              {formatearMoneda(calculateTotalConDescuento())}
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Descuento:{" "}
              {selectedDiscount
                ? `${selectedDiscount.porcentaje}%`
                : "No seleccionado"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Cliente:{" "}
              {registroAbierto?.cliente.nombre ||
                selectedCustomer?.nombre ||
                "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Método de pago:{" "}
              {selectedMetodPago}
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              onClick={() => {
                registroAbierto ? realizarVentaConVisita() : sendCartData();
              }}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                  Procesando...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" /> Confirmar venta
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

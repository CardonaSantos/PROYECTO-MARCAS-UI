import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus } from "lucide-react";
import { Producto } from "./types";
import ProductImageCarousel from "./ProductImageCarousel";

interface QuickViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product?: Producto;
  cantidadSeleccionada: number;
  setCantidadSeleccionada: (value: number) => void;
  cart: (Producto & { quantity: number })[];
  addToCart: (product: Producto, quantity: number) => void;
}

export default function QuickViewDialog({
  isOpen,
  setIsOpen,
  product,
  cantidadSeleccionada,
  setCantidadSeleccionada,
  cart,
  addToCart,
}: QuickViewDialogProps) {
  if (!product) return null;

  const inCart = cart.some((p) => p.id === product.id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[90%] max-h-[95%] sm:max-w-[80%] md:max-w-[600px] lg:max-w-[800px] mx-auto overflow-auto grid place-items-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {product.nombre}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Código: {product.codigoProducto}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1 md:py-0 md:grid-cols-2">
          <div className="order-2 md:order-1 relative">
            <ProductImageCarousel
              images={product.imagenes}
              productName={product.nombre}
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="h-[250px] md:h-[400px] w-full rounded-md border p-4 overflow-y-auto">
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-sm mb-4">{product.descripcion}</p>
              <ul className="text-sm space-y-2">
                <li>
                  <strong>Precio:</strong> Q{product.precio.toFixed(2)}
                </li>
                <li>
                  <strong>Stock:</strong> {product.stock?.cantidad ?? 0}
                </li>
                <li>
                  <strong>Categorías:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.categorias.map((cat, index) => (
                      <span
                        key={index}
                        className="inline-block bg-muted px-2 py-1 rounded text-xs"
                      >
                        {cat.categoria.nombre}
                      </span>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <Input
            type="number"
            min="1"
            max={product.stock?.cantidad || 1}
            value={cantidadSeleccionada}
            onChange={(e) =>
              setCantidadSeleccionada(
                Math.max(
                  1,
                  Math.min(
                    parseInt(e.target.value) || 1,
                    product.stock?.cantidad || 1
                  )
                )
              )
            }
            className="w-24 text-center"
          />
        </div>

        <div className="flex justify-end gap-4 w-full">
          <Button onClick={() => setIsOpen(false)} variant="destructive">
            Cerrar
          </Button>

          <Button
            onClick={() => addToCart(product, cantidadSeleccionada)}
            disabled={!product.stock || product.stock.cantidad === 0}
            className="w-full"
          >
            {inCart ? (
              <>
                <Check className="mr-2 h-4 w-4" /> En el carrito
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Añadir ({cantidadSeleccionada}
                )
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

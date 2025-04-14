import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search } from "lucide-react";
import type { Producto, CategoriaFiltrar } from "./types";
import { toast } from "sonner";

interface ProductListProps {
  productos: Producto[];
  cart: (Producto & { quantity: number })[];
  cantidades: Record<number, number>;
  handleCantidadChange: (id: number, value: number) => void;
  addToCart: (product: Producto, quantity: number) => void;
  hoveredProduct: number | null;
  setHoveredProduct: (id: number | null) => void;
  handleQuickView: (product: Producto) => void;
  isFetching: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoria: CategoriaFiltrar[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export default function ProductList({
  productos,
  cart,
  cantidades,
  handleCantidadChange,
  addToCart,
  hoveredProduct,
  setHoveredProduct,
  handleQuickView,
  isFetching,
  searchTerm,
  setSearchTerm,
  categoria,
  selectedCategory,
  setSelectedCategory,
  loadMoreRef,
}: ProductListProps) {
  return (
    <div className="w-full p-4">
      <div className="mb-4 shadow-xl p-4">
        <div className="pt-5 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar productos por nombre o código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas las categorías</SelectItem>
              {categoria?.map((cat) => (
                <SelectItem key={cat.nombre} value={cat.nombre}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[calc(100vh-100px)] shadow-xl rounded-lg overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {isFetching &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="h-[250px] bg-gray-300 rounded-md" />
              </div>
            ))}

          {productos.map((product) => (
            <motion.div
              key={`product-${product.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border rounded-lg overflow-hidden"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="p-4 relative">
                  <div className="aspect-w-1 aspect-h-1 w-full mb-4 relative">
                    <img
                      src={product.imagenes[0]?.url || "/placeholder.png"}
                      alt={product.nombre}
                      className="rounded-md object-cover w-full h-40"
                    />
                    {hoveredProduct === product.id && (
                      <Button
                        variant="secondary"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/60 text-white p-3 rounded-full"
                        onClick={() => handleQuickView(product)}
                      >
                        Vista Rápida
                      </Button>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.codigoProducto}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.categorias.map((cat, i) => (
                      <Badge key={i} variant="secondary">
                        {cat.categoria.nombre}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-lg">
                      Q{product.precio.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        product.stock?.cantidad ? "default" : "destructive"
                      }
                    >
                      {product.stock?.cantidad
                        ? `${product.stock.cantidad} en stock`
                        : "Agotado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={1}
                      max={product.stock?.cantidad}
                      value={cantidades[product.id] ?? 1}
                      onChange={(e) =>
                        handleCantidadChange(
                          product.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>
                <div className="p-4 border-t">
                  <Button
                    onClick={() => {
                      const cantidad = cantidades[product.id] ?? 1;
                      if (cart.some((p) => p.id === product.id)) {
                        toast("Ya en el carrito");
                      } else {
                        addToCart(product, cantidad);
                      }
                    }}
                    disabled={!product.stock || product.stock.cantidad === 0}
                    className={`w-full font-semibold text-white rounded-lg shadow-md ${
                      cart.some((p) => p.id === product.id)
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    {cart.some((p) => p.id === product.id) ? (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" /> Quitar del carrito
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Añadir (
                        {cantidades[product.id] ?? 1})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div ref={loadMoreRef} className="h-16"></div>
        {isFetching && (
          <p className="text-center text-xl font-bold">CARGANDO...</p>
        )}
      </div>
    </div>
  );
}

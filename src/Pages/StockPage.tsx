import { useState, useEffect } from "react";
import {
  Coins,
  Info,
  Loader2,
  Package2,
  Plus,
  Search,
  Truck,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Cambiamos Modal por Dialog
import axios from "axios";
import { toast } from "sonner";
import { Proveedor } from "@/Utils/Types/Proveedor";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const API_URL = import.meta.env.VITE_API_URL;

// Tipos actualizados
interface Stock {
  id: number;
  productoId: number;
  cantidad: number;
  proveedorId: number;
  costo: number;
  creadoEn: string;
  actualizadoEn: string;
}

interface Categoria1 {
  actualizadoEn: string;
  id: number;
  nombre: string;
}

interface Category {
  categoria: Categoria1;
  creadoEn: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  creadoEn: string;
  actualizadoEn: string;
  codigoProducto: string;
  stock: Stock | null;
  categorias: Category[];
}

interface StockItem {
  productoId: number;
  cantidad: number;
  costoUnitario: number;
  proveedorId: number;
}

export type Product = Producto;

export default function StockPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleAddToStock = () => {
    if (selectedProduct && quantity > 0 && unitCost > 0 && selectedProvider) {
      const productExists = stockItems.some(
        (item) => item.productoId === selectedProduct.id
      );

      if (productExists) {
        toast.error("Este producto ya está agregado a la lista.");
        return;
      }

      const newItem: StockItem = {
        productoId: selectedProduct.id,
        cantidad: quantity,
        costoUnitario: unitCost,
        proveedorId: selectedProvider,
      };

      setStockItems((prevItems) => [...prevItems, newItem]);
      handleCancel();
      toast.success("Producto agregado a la lista de stock.");
    } else {
      toast.error("Por favor, completa todos los campos.");
    }
  };

  const handleConfirmStock = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/stock`, {
        proveedorId: selectedProvider,
        productos: stockItems,
      });
      if (response.status === 201) {
        toast.success("Stock confirmado y enviado al inventario.");
        setStockItems([]);
        getProducts();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar stock");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setQuantity(0);
    setUnitCost(0);
  };

  const getProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/product`);
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("No hay productos disponibles");
    } finally {
      setIsLoading(false);
    }
  };

  const getProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/provider`);
      if (response.status === 200) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("No hay proveedores disponibles");
    }
  };

  useEffect(() => {
    getProducts();
    getProviders();
  }, []);

  const handleRemoveFromStock = (productoId: number) => {
    setStockItems((prevItems) =>
      prevItems.filter((item) => item.productoId !== productoId)
    );
    toast.success("Producto eliminado de la lista de stock.");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Asignar Stock a Productos</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Package2 className="inline-block mr-2" />
              Búsqueda de Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <label htmlFor="product-search" className="sr-only">
                Buscar producto
              </label>
              <Search
                className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="product-search"
                type="search"
                placeholder="Buscar producto por nombre o código"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px] mt-4">
              {filteredProducts.length > 0 ? (
                <ul role="listbox" aria-label="Lista de productos">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      role="option"
                      aria-selected={selectedProduct?.id === product.id}
                      className="p-2 border-b cursor-pointer hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => setSelectedProduct(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedProduct(product);
                        }
                      }}
                      tabIndex={0}
                    >
                      <p className="font-medium">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        Código: {product.codigoProducto}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground mt-4">
                  No se encontraron productos
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Plus className="inline-block mr-2" />
              Agregar Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad recibida</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  aria-describedby="quantity-error"
                />
                {quantity < 0 && (
                  <p id="quantity-error" className="text-sm text-destructive">
                    La cantidad debe ser mayor o igual a cero
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost">Costo por unidad</Label>
                <div className="relative">
                  <Coins
                    className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="pl-8"
                    aria-describedby="unitCost-error"
                  />
                </div>
                {unitCost < 0 && (
                  <p id="unitCost-error" className="text-sm text-destructive">
                    El costo debe ser mayor o igual a cero
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <Select
                  onValueChange={(value) => setSelectedProvider(Number(value))}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id.toString()}
                      >
                        {provider.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleAddToStock}
                      disabled={
                        !selectedProduct ||
                        isLoading ||
                        quantity <= 0 ||
                        unitCost <= 0 ||
                        !selectedProvider
                      }
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Agregar al inventario
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {!selectedProduct
                    ? "Selecciona un producto primero"
                    : quantity <= 0
                    ? "Ingresa una cantidad válida"
                    : unitCost <= 0
                    ? "Ingresa un costo válido"
                    : !selectedProvider
                    ? "Selecciona un proveedor"
                    : "Agregar producto al inventario"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Info className="inline-block mr-2" />
              Detalles del Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-2">
                <h3 className="font-bold">{selectedProduct.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  Código: {selectedProduct.codigoProducto}
                </p>
                <p className="font-semibold">
                  Stock actual:{" "}
                  {selectedProduct.stock?.cantidad !== undefined
                    ? selectedProduct.stock.cantidad
                    : "Sin stock registrado"}
                </p>
                <div>
                  <p className="font-medium">Categorías:</p>
                  <ul className="list-disc list-inside">
                    {selectedProduct.categorias.map((cat) => (
                      <li key={cat.categoria.id}>{cat.categoria.nombre}</li>
                    ))}
                  </ul>
                </div>
                {quantity > 0 && unitCost > 0 && (
                  <div className="p-2 bg-muted rounded-md">
                    <p className="font-semibold">Resumen de cambios:</p>
                    <p>
                      Nuevo stock:{" "}
                      {(selectedProduct.stock?.cantidad ?? 0) +
                        Number(quantity)}
                    </p>
                    <p>Nuevo costo de producto: Q{unitCost}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Selecciona un producto para ver los detalles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {stockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Truck className="inline-block mr-2" />
              Resumen de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo Unitario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item, index) => {
                    const product = products.find(
                      (p) => p.id === item.productoId
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {product ? product.nombre : `ID: ${item.productoId}`}
                        </TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>Q{item.costoUnitario}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRemoveFromStock(item.productoId)
                            }
                            aria-label={`Eliminar ${
                              product
                                ? product.nombre
                                : `producto ${item.productoId}`
                            } del inventario`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-semibold">
                Proveedor:{" "}
                {providers.find((p) => p.id === selectedProvider)?.nombre ||
                  "Sin proveedor"}
              </p>
              <p className="font-semibold">
                Total productos:{" "}
                {stockItems.reduce((acc, item) => acc + item.cantidad, 0)}
              </p>
              <p className="font-semibold">
                Costo total: Q
                {stockItems
                  .reduce(
                    (acc, item) => acc + item.cantidad * item.costoUnitario,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Confirmar Inventario</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Confirmar Inventario
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    ¿Estás seguro de que deseas confirmar y enviar este
                    inventario con esta información?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                  <Button onClick={handleConfirmStock} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

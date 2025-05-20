import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle,
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

interface Imagen {
  id: number;
  url: string;
  productoId: number;
  creadoEn: string;
}

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
  imagenes: Imagen[]; // Nueva propiedad
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
  // const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log("Los productos son: ", products);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchProducts(1);
    }
  }, [searchTerm]);

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

  const [openConfirStock, setOpenConfirmStock] = useState(false);

  const handleConfirmStock = async () => {
    if (stockItems.length <= 0) {
      toast.info("Seleccione los productos a añadir stock");
      return;
    }

    if (stockItems.some((prod) => prod.cantidad <= 0)) {
      toast.warning("La cantidad del stock no puede ser negativa");
      return;
    }

    if (stockItems.some((prod) => prod.costoUnitario <= 0)) {
      toast.info("El precio costo no debería ser negativo");
      return;
    }

    setIsLoading(true);

    // Retrasamos la resolución del toast por al menos 1 segundo
    const delay = 1000; // 1000ms = 1 segundo

    try {
      await toast.promise(
        new Promise(async (resolve, reject) => {
          try {
            // Hacemos la petición y luego resolvemos después del retraso
            const response = await axios.post(`${API_URL}/stock`, {
              proveedorId: selectedProvider,
              productos: stockItems,
            });
            setTimeout(() => {
              // Esperamos al menos `delay` tiempo antes de continuar
              resolve(response);
            }, delay);
          } catch (error) {
            setTimeout(() => {
              reject(error);
            }, delay);
          }
        }),
        {
          loading: "Enviando stock...",
          success: "Stock confirmado y enviado al inventario.",
          error: "Error al enviar stock",
        }
      );

      // Si la promesa es exitosa, se maneja después
      setStockItems([]);
      // getProducts();
      fetchProducts(1);
      setOpenConfirmStock(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setQuantity(0);
    setUnitCost(0);
  };
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [isFetching, setIsFetching] = useState(false);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (newPage: number) => {
    setIsFetching(true);
    try {
      const response = await axios.get(`${API_URL}/product/search`, {
        params: {
          query: searchTerm.trim(),
          page: newPage,
          limit: itemsPerPage,
        },
      });

      if (response.status === 200) {
        setProducts((prev) => {
          if (newPage === 1) return response.data.products;
          return [
            ...prev,
            ...response.data.products.filter(
              (p: Producto) =>
                !prev.some((existing: Producto) => existing.id === p.id)
            ),
          ];
        });
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // 🔍 Detectar scroll y cargar más productos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.2 } // Cambiar de 1.0 a 0.2
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isFetching, page, totalPages]);

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
    getProviders();
  }, []);

  const handleRemoveFromStock = (productoId: number) => {
    setStockItems((prevItems) =>
      prevItems.filter((item) => item.productoId !== productoId)
    );
    toast.success("Producto eliminado de la lista de stock.");
  };

  console.log("Los productos son: ", products);
  const enLista = (productoId: number): boolean => {
    return stockItems.some((producto) => producto.productoId === productoId);
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

              {/* Icono de búsqueda o botón de limpieza */}
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search
                  className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}

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
              {products.length > 0 ? (
                <ul role="listbox" aria-label="Lista de productos">
                  {products.map((product) => (
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

                      {enLista(product.id) ? (
                        <span className="text-green-600 font-bold">
                          En lista
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground mt-4">
                  No se encontraron productos
                </p>
              )}
              <div ref={loadMoreRef} className="h-16"></div>
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

                {selectedProduct.imagenes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {selectedProduct.imagenes.map((image, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden bg-white dark:bg-gray-800 transition-shadow duration-300 hover:shadow-lg"
                      >
                        <CardContent className="p-0">
                          <div className="aspect-square relative">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={`Imagen recortada ${index + 1}`}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h2>No hay imagenes</h2>
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
          </CardFooter>
        </Card>
      )}

      <Dialog onOpenChange={setOpenConfirmStock} open={openConfirStock}>
        <Button
          onClick={() => {
            setOpenConfirmStock(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Confirmar Inventario
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-xl font-semibold text-primary">
              <AlertTriangle className="w-6 h-6 mr-2 text-warning" />
              Confirmar Inventario
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-muted-foreground">
              ¿Estás seguro de que deseas confirmar y enviar este inventario con
              esta información?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
            <p className="text-sm text-muted-foreground">
              Esta acción finalizará el proceso de inventario actual.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Asegúrate de haber revisado toda la información antes de
              confirmar.
            </p>
          </div>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setOpenConfirmStock(false);
              }}
              variant="destructive"
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmStock}
              disabled={isLoading}
              className="w-full  bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

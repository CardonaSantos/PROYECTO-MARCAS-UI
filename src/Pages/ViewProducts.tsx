import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  Barcode,
  DollarSign,
  Tag,
  ShoppingCart,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Tags,
  X,
  Save,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SelectM, { MultiValue } from "react-select"; // Importación correcta de react-select

import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const API_URL = import.meta.env.VITE_API_URL;
// Mock product data
// Tipos para Producto y Categoría
type Producto = {
  id: number;
  nombre: string;
  codigoProducto: string;
  descripcion: string;
  precio: number;
  categorias: { categoria: { id: number; nombre: string } }[]; // Incluyo el ID de categoría
  stock: { cantidad: number };
};

// Estado para editar el producto
interface ProductoEdit {
  id: number;
  nombre: string;
  codigoProducto: string;
  descripcion: string;
  categoriaIds: number[]; // IDs de las categorías
  precio: number;
}

type Categoria = {
  id: number;
  nombre: string;
  creadoEn: string;
  actualizadoEn: string;
};

export default function ViewProducts() {
  const [categoria, setCategoria] = useState<Categoria[]>([]);
  const [products, setProducts] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  console.log(categoria);

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [editedProduct, setEditedProduct] = useState<ProductoEdit>({
    nombre: "",
    id: 0,
    codigoProducto: "",
    descripcion: "",
    categoriaIds: [],
    precio: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "Todas",
    priceRange: [0, 300],
  });

  // Obtener productos desde el API
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/product`);
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar productos");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Obtener categorías desde el API
  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categories/simple-categories`
      );
      if (response.status === 200) {
        setCategoria(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Filtrar productos según filtros y búsqueda
  const filteredProducts = products.filter(
    (product) =>
      (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || // Buscar en nombre
        product.codigoProducto
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) && // Buscar en código
      product.precio >= filters.priceRange[0] && // Filtrar por precio mínimo
      product.precio <= filters.priceRange[1] && // Filtrar por precio máximo
      (filters.category === "Todas" || // Filtrar por categoría (opcional)
        product.categorias.some(
          (cat) => cat.categoria.nombre === filters.category
        ))
  );

  // Manejar cambios en el formulario de edición
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: name === "precio" ? Number(value) : value,
    });
  };

  // Función para mostrar el producto en modo de edición
  const handleEditProduct = (product: Producto) => {
    // setSelectedProduct(product);
    setEditedProduct({
      id: product.id,
      nombre: product.nombre,
      codigoProducto: product.codigoProducto,
      descripcion: product.descripcion,
      categoriaIds: product.categorias.map((cat) => cat.categoria.id),
      precio: product.precio,
    });
  };

  // Función para mostrar los detalles del producto
  const handleShowDetails = (product: Producto) => {
    setSelectedProduct(product);
  };

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/categories/simple-categories`
        );
        if (response.status === 200) {
          setCategorias(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error al pedir categorias");
      }
    };
    getCategories();
  }, []);

  console.log("El producto a actualizar es: ", editedProduct);
  const handleUpdateProducto = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/product/${editedProduct?.id}`,
        {
          nombre: editedProduct.nombre,
          categoriasIds: editedProduct.categoriaIds,
          codigoProducto: editedProduct.codigoProducto,
          descripcion: editedProduct.descripcion,
          precio: editedProduct.precio,
        }
      );

      if (response.status === 200 || response.status == 201) {
        toast.success("Producto actualizado correctamente");

        // Vuelve a cargar los productos después de actualizar
        await getProducts();
        setOpenEdit(false);
        // Limpia el producto seleccionado
        setEditedProduct({
          nombre: "",
          id: 0,
          codigoProducto: "",
          descripcion: "",
          categoriaIds: [],
          precio: 0,
        });
        setSelectedProduct(null); // Cierra el modal o panel de edición
      }
    } catch (error) {
      console.log(error);
      toast.warning("Error al actualizar producto");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // PAGINACIÓN
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);
  // Calcular el índice del último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calcular el índice del primer elemento de la página actual
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Obtener los elementos de la página actual
  const currentItems =
    filteredProducts &&
    filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  // Cambiar de página
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gestión de Inventario</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Buscar producto por nombre..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar producto por nombre"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="filters-panel"
        >
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" /> Filtros
        </Button>
      </div>

      {showFilters && (
        <div
          id="filters-panel"
          className="mb-6 p-4 border rounded-lg bg-gray-50"
        >
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-select">Categoría</Label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  {categorias.map((category) => (
                    <SelectItem key={category.id} value={category.nombre}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price-range">Rango de Precio</Label>
              <Slider
                id="price-range"
                min={0}
                max={300}
                step={10}
                value={filters.priceRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, priceRange: value })
                }
                className="mt-2"
              />
              <div className="flex justify-between mt-2">
                <span>Q{filters.priceRange[0]}</span>
                <span>Q{filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="sr-only">Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Package className="inline-block mr-2" aria-hidden="true" />
                  Nombre
                </TableHead>
                <TableHead>
                  <Barcode className="inline-block mr-2" aria-hidden="true" />
                  Código
                </TableHead>
                <TableHead>
                  <DollarSign
                    className="inline-block mr-2"
                    aria-hidden="true"
                  />
                  Precio
                </TableHead>
                <TableHead>
                  <Tag className="inline-block mr-2" aria-hidden="true" />
                  Categorías
                </TableHead>
                <TableHead>
                  <ShoppingCart
                    className="inline-block mr-2"
                    aria-hidden="true"
                  />
                  Stock
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.nombre}
                    </TableCell>
                    <TableCell>{product.codigoProducto}</TableCell>
                    <TableCell>Q{product.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-[11px]">
                      {product.categorias
                        .map((cat) => cat.categoria.nombre) // Extraer los nombres de las categorías
                        .join(", ")}{" "}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          product?.stock?.cantidad > 0
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {product?.stock?.cantidad > 0
                          ? `En Stock (${product?.stock?.cantidad})`
                          : "Fuera de Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDetails(product)}
                          aria-label={`Ver detalles de ${product.nombre}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpenEdit(true);
                            handleEditProduct(product);
                          }}
                          aria-label={`Editar ${product.nombre}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No hay productos disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-center py-4">
          <Pagination aria-label="Navegación de páginas de productos">
            <PaginationContent>
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(1)}
                  aria-label="Ir a la primera página"
                >
                  <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>

              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => onPageChange(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-muted-foreground">...</span>
                  </PaginationItem>
                </>
              )}

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                if (
                  page === currentPage ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <span className="text-muted-foreground">...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink onClick={() => onPageChange(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(totalPages)}
                  aria-label="Ir a la última página"
                >
                  <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Editar Producto
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProducto();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Nombre del Producto
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={editedProduct?.nombre || ""}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio
              </Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                value={editedProduct?.precio || ""}
                onChange={handleInputChange}
                required
                aria-required="true"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="codigoProducto"
                className="flex items-center gap-2"
              >
                <Barcode className="h-4 w-4" />
                Código del Producto
              </Label>
              <Input
                id="codigoProducto"
                name="codigoProducto"
                value={editedProduct?.codigoProducto || ""}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorias" className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Categorías
              </Label>
              <SelectM
                inputId="categorias"
                placeholder="Seleccionar..."
                isMulti
                name="categorias"
                options={categorias.map((categoria) => ({
                  value: categoria.id,
                  label: categoria.nombre,
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(
                  selectedOptions: MultiValue<{
                    value: number;
                    label: string;
                  }>
                ) => {
                  const selectedIds = selectedOptions.map(
                    (option) => option.value
                  );
                  setEditedProduct({
                    ...editedProduct,
                    categoriaIds: selectedIds,
                  });
                }}
                value={categorias
                  .filter((categoria) =>
                    editedProduct.categoriaIds?.includes(categoria.id)
                  )
                  .map((categoria) => ({
                    value: categoria.id,
                    label: categoria.nombre,
                  }))}
                aria-label="Seleccionar categorías"
              />
            </div>
          </form>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleUpdateProducto}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-6 w-6 text-primary" />
              Detalles del Producto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <h3 className="text-xl font-semibold text-primary">
              {selectedProduct?.nombre || "Producto sin nombre"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                  <strong>Código:</strong>{" "}
                  {selectedProduct?.codigoProducto || "No disponible"}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <strong>Precio:</strong>{" "}
                  {selectedProduct?.precio !== undefined
                    ? `Q${selectedProduct.precio.toFixed(2)}`
                    : "No disponible"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>
                    <strong>Descripción:</strong>
                    <br />
                    {selectedProduct?.descripcion || "No disponible"}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <strong className="flex items-center gap-2 mb-2">
                <Tags className="h-4 w-4 text-muted-foreground" />
                Categorías:
              </strong>
              <div className="flex flex-wrap gap-2">
                {selectedProduct?.categorias &&
                selectedProduct.categorias.length > 0
                  ? selectedProduct.categorias.map((cat, index) => (
                      <Badge key={index} variant="secondary">
                        {cat.categoria.nombre}
                      </Badge>
                    ))
                  : "Sin categorías"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <Badge
                variant={
                  selectedProduct?.stock?.cantidad &&
                  selectedProduct.stock.cantidad > 0
                    ? "outline"
                    : "destructive"
                }
                className="text-sm py-1 px-2"
              >
                {selectedProduct?.stock?.cantidad &&
                selectedProduct.stock.cantidad > 0
                  ? `En Stock (${selectedProduct.stock.cantidad})`
                  : "Fuera de Stock (0)"}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

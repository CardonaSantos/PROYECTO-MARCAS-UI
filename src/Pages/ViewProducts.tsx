import { useCallback, useEffect, useState } from "react";
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
  ImageIcon,
  Trash,
  ImagePlus,
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
import placeholder from "@/assets/images/placeholder.jpg";

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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDropzone } from "react-dropzone";
import { getCroppedImg } from "./Tools/cropImage";
import Cropper from "react-easy-crop";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL;
// Mock product data
// Tipos para Producto y Categoría
interface Imagen {
  id: number;
  url: string;
  productoId: number;
  creadoEn: string;
}

type Producto = {
  id: number;
  nombre: string;
  codigoProducto: string;
  descripcion: string;
  precio: number;
  costo?: number;
  categorias: { categoria: { id: number; nombre: string } }[]; // Incluyo el ID de categoría
  stock: { cantidad: number };
  imagenes: Imagen[]; // Nueva propiedad
};

// Estado para editar el producto
interface ProductoEdit {
  id: number;
  nombre: string;
  codigoProducto: string;
  descripcion: string;
  categoriaIds: number[]; // IDs de las categorías
  precio: number;
  costo?: number;
  imagenes: Imagen[]; // Nueva propiedad
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
    costo: 0,
    imagenes: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "Todas",
    priceRange: [0, 5000],
  });

  const [isLoading, setIsLoading] = useState(false);
  // Obtener productos desde el API
  const getProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/product/get-product-to-inventary`
      );
      if (response.status === 200) {
        setProducts(response.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
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
      (searchTerm
        ? product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.codigoProducto
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true) && // Solo filtrar por búsqueda si searchTerm tiene algo
      product.precio >= filters.priceRange[0] && // Rango de precio mínimo
      product.precio <= filters.priceRange[1] && // Rango de precio máximo
      (filters.category === "Todas" || // Verificar si la categoría está bien definida
        product.categorias?.some(
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
      costo: product.costo,
      imagenes: product.imagenes,
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
          precioCosto: editedProduct.costo,
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
          costo: 0,
          imagenes: [],
        });
        setSelectedProduct(null); // Cierra el modal o panel de edición
      }
    } catch (error) {
      console.log(error);
      toast.warning("Error al actualizar producto");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

  //=============================================>
  interface ProductImageCarouselProps {
    images: { url: string }[];
    productName: string;
  }
  function ProductImageCarousel({
    images,
    productName,
  }: ProductImageCarouselProps) {
    return (
      <div className="relative w-full max-w-xs mx-auto aspect-square overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.length > 0 ? (
              images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-2">
                        <img
                          src={image.url ? image.url : placeholder}
                          alt={`${productName} - Image ${index + 1}`}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-2">
                      <img
                        src={placeholder}
                        alt="Imagen no disponible"
                        className="object-cover w-full h-full rounded-md"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
        </Carousel>
      </div>
    );
  }
  console.log("Mis PRODUCTOS SON: ", products);
  console.log("PRODUCTOS FILTRADOS: ", filteredProducts);

  const extractPublicIdFromUrl = (url: string) => {
    const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
    return matches ? matches[1] : null;
  };

  const handleDeleteImage = async (imageUrl: string, imageId: number) => {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      toast.error("ID público no encontrado");
      return;
    }

    console.log("EL PUBLIC ID DE LA IMAGEN ES: ", publicId);

    const deletePromise = axios.delete(
      `${API_URL}/product/delete-one-image-product/${editedProduct.id}/image/${imageId}?publicId=${publicId}`
    );

    toast.promise(deletePromise, {
      loading: "Eliminando imagen...",
      success: async () => {
        setEditedProduct((prev) => ({
          ...prev,
          imagenes: prev.imagenes?.filter((img) => img.url !== imageUrl) || [],
        }));
        await getProducts();
        return "Imagen eliminada correctamente";
      },
      error: "Error al eliminar la imagen",
    });

    await deletePromise;
  };

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat("es-GT", {
      currency: "GTQ",
      style: "currency",
    }).format(cantidad);
  };

  //DATOS PARA EL CROP DE IMAGENES Y MODIFICACION
  const [productToUpdateImages, setProductToUpdateImages] = useState(0);
  const [showAddImageDialog, setShowAddImageDialog] = useState(false);

  interface CroppedImage {
    productId: number;
    image: string;
  }

  //=========================================>
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<CroppedImage[]>([]);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppingArea, setCroppingArea] = useState<any>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [useFullImage, setUseFullImage] = useState<boolean>(false);

  console.log(useFullImage);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setSelectedImage(imageUrl);
      setShowCropper(true);
      setUseFullImage(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppingArea(croppedAreaPixels);
  };

  const handleCropImage = async () => {
    if (selectedImage && croppingArea) {
      const croppedImageUrl = await getCroppedImg(selectedImage, croppingArea);
      if (!croppedImageUrl) return;
      setNewImages((prev) => [
        ...prev,
        { productId: productToUpdateImages, image: croppedImageUrl },
      ]);
      setShowCropper(false);
      setSelectedImage(null);
    }
  };

  const handleUseFullImage = () => {
    if (selectedImage) {
      setNewImages((prev) => [
        ...prev,
        { productId: productToUpdateImages, image: selectedImage },
      ]);
      setShowCropper(false);
      setUseFullImage(true);
      setSelectedImage(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (newImages.length <= 0) {
      toast.info("Ingrese una imagen");
      return;
    }

    const imagesArray = newImages.map((img) => img.image);
    const uploadPromise = axios.patch(
      `${API_URL}/product/update-images-product/${productToUpdateImages}`,
      {
        images: imagesArray,
      }
    );

    toast.promise(uploadPromise, {
      loading: "Subiendo imágenes...",
      success: "Imágenes subidas correctamente!",
      error: "Error al subir imágenes",
    });

    try {
      const response = await uploadPromise;
      if (response.status === 200 || response.status === 201) {
        getProducts();
        setNewImages([]);
        setShowAddImageDialog(false);
        setOpenEdit(false);
      }
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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
          className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-transparent"
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
                max={5000}
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
      <h2 className="text-base font-semibold my-4">
        Productos encontrados: {filteredProducts.length}
      </h2>

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
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[70px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : currentItems && currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.nombre}
                    </TableCell>
                    <TableCell>{product.codigoProducto}</TableCell>
                    <TableCell>{formatearMoneda(product.precio)}</TableCell>
                    <TableCell className="text-[11px]">
                      {product.categorias
                        .map((cat) => cat.categoria.nombre)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {product?.stock?.cantidad > 0 ? (
                        <span className="text-black font-bold dark:text-white">
                          En Stock ({product?.stock?.cantidad})
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">
                          Fuera de Stocks
                        </span>
                      )}
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
                            setProductToUpdateImages(product.id);
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
          {!isLoading && (
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
                          aria-current={
                            page === currentPage ? "page" : undefined
                          }
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
          )}
        </CardFooter>
      </Card>
      {/* DIALOG DE EDICION DE PRODUCTO */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[550px] lg:max-w-[600px] max-h-[98vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Editar Producto
            </DialogTitle>
          </DialogHeader>

          {/* Contenedor desplazable */}
          <div className="overflow-y-auto flex-grow px-4">
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
                <Label htmlFor="costo" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio Costo
                </Label>
                <Input
                  id="costo"
                  name="costo"
                  type="number"
                  value={editedProduct?.costo || ""}
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

              {/* EDICION DE IMAGENES DEL PRODUCTO */}
              <div className="space-y-4 pb-6">
                {" "}
                {/* Agregamos un padding-bottom */}
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Imágenes del Producto
                </Label>
                <div className="max-h-[300px]">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-3 gap-2 p-1">
                      {editedProduct?.imagenes?.map((imagen, index) => (
                        <div
                          key={index}
                          className="relative group rounded-md overflow-hidden shadow-lg transition-all hover:shadow-xl"
                        >
                          <img
                            src={imagen.url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md border transition-all transform hover:scale-105"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 rounded-full hover:bg-red-700"
                            onClick={() => {
                              handleDeleteImage(imagen.url, imagen.id);
                            }}
                          >
                            <Trash className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </form>
          </div>

          {/* Footer fijo */}
          <DialogFooter className="sm:justify-between bg-white dark:bg-transparent py-3 border-t">
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowAddImageDialog(true)}
            >
              <ImagePlus className="h-4 w-4" />
              Añadir nuevas imágenes
            </Button>

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
      {/* DIALOG DE DETALLES DE PRODUCTO */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-[550px] lg:max-w-[600px] max-h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-6 w-6 text-primary" />
              Detalles del Producto
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Carrusel centrado y cuadrado */}
            {selectedProduct?.imagenes && (
              <div className="flex justify-center">
                <ProductImageCarousel
                  images={selectedProduct.imagenes}
                  productName={selectedProduct.nombre}
                />
              </div>
            )}

            {selectedProduct && (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <h3 className="text-xl font-semibold text-primary">
                  {selectedProduct?.nombre || "Producto sin nombre"}
                </h3>

                {/* Detalles del producto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? `${formatearMoneda(selectedProduct.precio)}`
                        : "No disponible"}
                    </p>

                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <strong>Precio Costo:</strong>{" "}
                      {selectedProduct?.costo !== undefined
                        ? `${formatearMoneda(selectedProduct?.costo) ?? 0}`
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

                {/* Categorías */}
                <div>
                  <strong className="flex items-center gap-2 mb-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    Categorías:
                  </strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct?.categorias?.length > 0
                      ? selectedProduct.categorias.map((cat, index) => (
                          <Badge key={index} variant="secondary">
                            {cat.categoria.nombre}
                          </Badge>
                        ))
                      : "Sin categorías"}
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <Badge
                    variant={
                      selectedProduct?.stock?.cantidad > 0
                        ? "outline"
                        : "destructive"
                    }
                    className="text-sm py-1 px-2"
                  >
                    {selectedProduct?.stock?.cantidad > 0
                      ? `En Stock (${selectedProduct.stock.cantidad})`
                      : "Fuera de Stock (0)"}
                  </Badge>
                </div>
              </div>
            )}
            {/* Contenido principal con scroll si es necesario */}
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
      {/* DIALOG PARA ACTUALIZAR LAS NUEVAS IMAGENES */}
      <Dialog open={showAddImageDialog} onOpenChange={setShowAddImageDialog}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Subir imágenes</DialogTitle>
          </DialogHeader>

          <div className="p-4 flex-1 overflow-auto">
            <div
              {...getRootProps()}
              className="border p-4 rounded-md cursor-pointer text-center"
            >
              <input {...getInputProps()} />
              <p>Arrastra una imagen aquí o haz clic para seleccionarla</p>
            </div>

            {selectedImage && showCropper && (
              <div className="relative w-full h-64 mt-4">
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="rect"
                  showGrid={true}
                />
              </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
              {showCropper && (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCropper(false);
                      setSelectedImage(null);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setCroppingArea(null);
                    }}
                    className="bg-gray-500"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCropImage}
                    className="bg-blue-500"
                  >
                    Recortar y Guardar
                  </Button>

                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={handleUseFullImage}
                    className="bg-green-500"
                  >
                    Usar imagen completa
                  </Button>
                </>
              )}
              {!showCropper && selectedImage && (
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={handleUseFullImage}
                  className="bg-green-500"
                >
                  Usar imagen completa
                </Button>
              )}
            </div>

            <div className="p-4">
              <p className="text-sm font-semibold mb-2">Imágenes a subir:</p>
              <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-auto">
                {newImages.map((img, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0 relative group">
                      <img
                        src={img.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Footer fijo abajo */}
          <DialogFooter
            className="flex justify-between bg-white 
          dark:bg-transparent
          py-4 border-t"
          >
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleConfirmUpload}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Confirmar subida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

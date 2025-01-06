import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Barcode,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
  Save,
  Tags,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Category {
  id: number;
  nombre: string;
}

interface FormData {
  nombre: string;
  codigoProducto: string;
  descripcion: string;
  categoriaIds: number[];
  precio: number;
}

export default function CreateProduct() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    codigoProducto: "",
    descripcion: "",
    categoriaIds: [],
    precio: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "precio" ? parseFloat(value) : value,
    });
  };

  const handleCategoryChange = (
    selectedOptions: readonly { value: number; label: string }[]
  ) => {
    setFormData({
      ...formData,
      categoriaIds: selectedOptions.map((option) => option.value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.precio <= 0) {
      toast.warning("El precio no debe ser menor o igual a cero");
      return;
    }

    if (formData.categoriaIds.length <= 0) {
      toast.warning("El producto debe pertenecer a al menos una categoría");
      return;
    }

    validateForm();

    try {
      const response = await axios.post(`${API_URL}/product`, formData);
      if (response.status === 201) {
        toast.success("Producto creado exitosamente");
        handleClean();
      }
    } catch (error) {
      console.error(error);
      toast.error("Algo salió mal al crear el producto");
    }
  };

  const handleClean = () => {
    setFormData({
      nombre: "",
      codigoProducto: "",
      descripcion: "",
      categoriaIds: [],
      precio: 0,
    });
  };

  const getCategories = async () => {
    try {
      const response = await axios.get<Category[]>(`${API_URL}/categories`);
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las categorías");
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const getCategoryNames = () => {
    return formData.categoriaIds
      .map((id) => categories.find((cat) => cat.id === id)?.nombre)
      .filter(Boolean)
      .join(", ");
  };

  type Errors = {
    nombre?: string;
    codigoProducto?: string;
    precio?: string;
    categorias?: string;
  };

  const [errors, setErrors] = useState<Errors>({});

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.codigoProducto.trim())
      newErrors.codigoProducto = "El código es requerido";
    if (!formData.precio || isNaN(Number(formData.precio)))
      newErrors.precio = "Ingrese un precio válido";
    if (formData.categoriaIds.length === 0)
      newErrors.categorias = "Seleccione al menos una categoría";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Package className="h-8 w-8" />
        Crear Nuevo Producto
      </h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles del Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Nombre del producto
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  aria-describedby="nombre-description"
                  aria-invalid={!!errors.nombre}
                />
                <p
                  id="nombre-description"
                  className="text-sm text-muted-foreground"
                >
                  Ingrese el nombre completo del producto.
                </p>
                {errors.nombre && (
                  <p
                    role="alert"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="codigoProducto"
                  className="flex items-center gap-2"
                >
                  <Barcode className="h-4 w-4" />
                  Código del producto
                </Label>
                <Input
                  id="codigoProducto"
                  name="codigoProducto"
                  value={formData.codigoProducto}
                  onChange={handleChange}
                  required
                  aria-describedby="codigo-description"
                  aria-invalid={!!errors.codigoProducto}
                />
                <p
                  id="codigo-description"
                  className="text-sm text-muted-foreground"
                >
                  Ingrese un código único para el producto.
                </p>
                {errors.codigoProducto && (
                  <p
                    role="alert"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.codigoProducto}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="descripcion"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Descripción del producto
                </Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  aria-describedby="descripcion-description"
                />
                <p
                  id="descripcion-description"
                  className="text-sm text-muted-foreground"
                >
                  Proporcione una descripción detallada del producto.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categorias" className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Categorías
                </Label>
                <Select
                  placeholder="Seleccionar categorías"
                  id="categorias"
                  isMulti
                  name="categorias"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.nombre,
                  }))}
                  value={formData.categoriaIds
                    .map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return cat ? { value: cat.id, label: cat.nombre } : null;
                    })
                    .filter((v) => v !== null)}
                  onChange={handleCategoryChange}
                  className="basic-multi-select text-black font-semibold"
                  classNamePrefix="select"
                  aria-describedby="categorias-description"
                  aria-invalid={!!errors.categorias}
                />
                <p
                  id="categorias-description"
                  className="text-sm text-muted-foreground"
                >
                  Seleccione una o más categorías para el producto.
                </p>
                {errors.categorias && (
                  <p
                    role="alert"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.categorias}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio de Venta
                </Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  aria-describedby="precio-description"
                  aria-invalid={!!errors.precio}
                />
                <p
                  id="precio-description"
                  className="text-sm text-muted-foreground"
                >
                  Ingrese el precio de venta del producto.
                </p>
                {errors.precio && (
                  <p
                    role="alert"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.precio}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Crear producto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClean}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Vista Previa del Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">
                {formData.nombre || "Nombre del producto"}
              </h3>
              <p className="text-sm flex items-center gap-2">
                <Barcode className="h-4 w-4 text-muted-foreground" />
                <strong>Código:</strong> {formData.codigoProducto || "N/A"}
              </p>
              <p className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <span>
                  <strong>Descripción:</strong> {formData.descripcion || "N/A"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Tags className="h-4 w-4 text-muted-foreground" />
                <strong>Categorías:</strong> {getCategoryNames() || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <strong>Precio de venta:</strong> Q
                {parseFloat(`${formData.precio || "0"}`).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

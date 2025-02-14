import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Barcode,
  DollarSign,
  Edit2,
  FileText,
  Package,
  RefreshCw,
  Save,
  Tags,
  Trash2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./Tools/cropImage";
import { Area } from "react-easy-crop";
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
  fotos: string[];
}

export default function CreateProduct() {
  //OTROS
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppingArea, setCroppingArea] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Índice de la imagen en edición

  console.log("Imágenes recortadas: ", croppedImages);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  //

  const onCropChange = (newCrop: any) => {
    setCrop(newCrop); // Cambia la posición del cuadro de recorte
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom); // Cambia el nivel de zoom de la imagen
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    codigoProducto: "",
    descripcion: "",
    categoriaIds: [],
    precio: 0,
    fotos: [],
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

  const handleClean = () => {
    setFormData({
      nombre: "",
      codigoProducto: "",
      descripcion: "",
      categoriaIds: [],
      precio: 0,
      fotos: [],
    });
    setCroppedImages([]);
    setSelectedImage(null);
    setShowCropper(false);
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
    console.log("Los datos a enviar son: ", formData);
    console.log(formData.fotos.length);

    setFormData({
      ...formData,
      fotos: croppedImages, // Verifica si croppedImages tiene las imágenes esperadas
    });

    if (formData.fotos.length <= 0) {
      toast.warning("No hay fotos");
      return;
    }

    try {
      await toast.promise(
        axios.post(`${API_URL}/product`, formData).then((response) => {
          if (response.status === 201) {
            handleClean();
          }
          return response;
        }),
        {
          loading: "Creando producto...",
          success: "Producto creado exitosamente",
          error: "Algo salió mal al crear el producto",
        }
      );
    } catch (error) {
      console.error(error);
    }
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

  //CROPS
  ///==============================================>
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSelectedImage(imageUrl);
        setShowCropper(true);

        // Solo guardamos si no estamos editando
        if (editingIndex === null) {
          setOriginalImages((prev) => [...prev, imageUrl]);
        }
      };
      reader.readAsDataURL(file);
    },
    [editingIndex]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // Guardar la posición del área de recorte
  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppingArea(croppedAreaPixels);
  };

  const handleCropImage = async () => {
    if (selectedImage && croppingArea) {
      const croppedImageUrl = await getCroppedImg(selectedImage, croppingArea);

      if (!croppedImageUrl) {
        return;
      }

      setCroppedImages((prev) => {
        const updatedImages = [...prev];
        if (editingIndex !== null) {
          updatedImages[editingIndex] = croppedImageUrl; // Edita la imagen existente
        } else {
          updatedImages.push(croppedImageUrl); // Agrega una nueva imagen recortada
        }
        return updatedImages;
      });

      // Actualizar originalImages solo cuando se recorta
      if (editingIndex !== null) {
        const updatedOriginalImages = [...originalImages];
        updatedOriginalImages[editingIndex] = selectedImage; // Reemplaza con la imagen original
        setOriginalImages(updatedOriginalImages);
      } else {
        setOriginalImages((prev) => [...prev, selectedImage!]);
      }

      setShowCropper(false);
      setSelectedImage(null);
      setEditingIndex(null);
    }
  };

  const handleDeleteImage = (index: number) => {
    // Elimina de croppedImages
    setCroppedImages((prev) => prev.filter((_, i) => i !== index));

    // Elimina de originalImages
    setOriginalImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fotos: croppedImages,
    }));
  }, [croppedImages]); // Actualiza formData.fotos cuando croppedImages cambie

  const [useFullImage, setUseFullImage] = useState(false);

  const handleUseFullImage = () => {
    if (selectedImage) {
      setCroppedImages((prevImages) => {
        if (editingIndex !== null) {
          const updatedImages = [...prevImages];
          updatedImages[editingIndex] = selectedImage;
          return updatedImages;
        }
        return [...prevImages, selectedImage];
      });

      setUseFullImage(false); // Reset para evitar que afecte nuevas selecciones
      setShowCropper(false);
      setEditingIndex(null);
      setSelectedImage(null);
    }
  };

  const handleEdit = (index: number) => {
    // Tomamos la imagen desde croppedImages para asegurar que sea la más actual
    setSelectedImage(croppedImages[index]);
    setShowCropper(true);
    setUseFullImage(false);
    setEditingIndex(index);
  };

  useEffect(() => {
    if (selectedImage) {
      setUseFullImage(false); // Resetear cuando haya una nueva imagen
    }
  }, [selectedImage]);

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

              {/* PRECIOVENTA */}
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

              {/* Área para subir imágenes */}

              {/* Área para subir imágenes */}
              <div className="p-4">
                {/* Input para subir imagen */}
                <div
                  {...getRootProps()}
                  className="border p-4 rounded-md cursor-pointer text-center"
                >
                  <input {...getInputProps()} />
                  <p>Arrastra una imagen aquí o haz clic para seleccionarla</p>
                </div>

                {/* Cropper o imagen completa */}
                {selectedImage && (
                  <>
                    {!useFullImage && showCropper && (
                      <div className="relative w-full max-w-sm mx-auto aspect-[4/3] mt-4">
                        {/* Cropper */}
                        <Cropper
                          image={selectedImage}
                          crop={crop}
                          zoom={zoom}
                          onCropChange={onCropChange}
                          onCropComplete={onCropComplete}
                          onZoomChange={onZoomChange}
                          cropShape="rect"
                          showGrid={true}
                        />
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {!useFullImage && (
                        <>
                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setShowCropper(false);
                              setUseFullImage(false);
                              setCrop({ x: 0, y: 0 });
                              setZoom(1);
                              setEditingIndex(null);
                            }}
                            className="bg-gray-500 w-full sm:w-auto"
                          >
                            Cancelar
                          </Button>

                          <Button
                            type="button"
                            onClick={handleCropImage}
                            className="bg-blue-500 w-full sm:w-auto"
                          >
                            Recortar y Guardar
                          </Button>
                        </>
                      )}

                      {!useFullImage && (
                        <Button
                          type="button"
                          onClick={handleUseFullImage}
                          className="bg-green-500 w-full sm:w-auto"
                        >
                          Usar imagen completa
                        </Button>
                      )}
                    </div>
                  </>
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

        {/* VISTA PREVIA PRODUCTO */}
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

            {/* VISUALIZAR IMAGENES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {croppedImages.map((image, index) => (
                <Card
                  key={index}
                  className="overflow-hidden bg-white dark:bg-gray-800 transition-shadow duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Imagen recortada ${index + 1}`}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-between items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      className="w-full"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(index)}
                      className="w-full"
                    >
                      <Trash2 className="" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = import.meta.env.VITE_API_URL;

interface Category extends Categoria {
  id: number;
  creadoEn: string;
  actualizadoEn: string;
}

interface Categoria {
  nombre: string;
}

export default function CrearCategoria() {
  const [categoria, setCategoria] = useState<Categoria>({
    nombre: "",
  });

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ nombre?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();

    try {
      const response = await axios.post(`${API_URL}/categories`, categoria);
      if (response.status === 201 || response.status === 200) {
        toast.success("Categoría creada");
        setCategoria({ nombre: "" });
        getCategories(); // Refrescar lista de categorías
      }
    } catch (error) {
      toast.error("Error al crear categoría");
    }
  };

  const handleEditSubmit = async () => {
    if (!editingCategory) return;
    validateForm();
    try {
      const response = await axios.patch(
        `${API_URL}/categories/${editingCategory.id}`,
        {
          nombre: categoria.nombre,
        }
      );
      if (response.status === 201 || response.status === 200) {
        toast.success("Categoría actualizada");
        getCategories(); // Refrescar lista de categorías
        closeModal();
      }
    } catch (error) {
      toast.error("Error al actualizar categoría");
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categories/get-all-categories`
      );
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar categorías");
    }
  };

  const openModal = (category: Category) => {
    setEditingCategory(category);
    setCategoria({ nombre: category.nombre });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoria({ nombre: "" });
    setEditingCategory(null);
  };

  const handleDelete = async () => {
    if (categoryToDelete === null) return;

    try {
      const response = await axios.delete(
        `${API_URL}/categories/${categoryToDelete}`
      );
      if (response.status === 200) {
        toast.success("Categoría eliminada");
        getCategories(); // Refrescar la lista
      }
    } catch (error) {
      toast.error("Error al eliminar categoría");
    } finally {
      closeConfirmDialog();
    }
  };

  const openConfirmDialog = (id: number) => {
    setCategoryToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setCategoryToDelete(null);
  };

  useEffect(() => {
    getCategories();
  }, []);

  interface newError {
    nombre?: string;
  }
  const validateForm = () => {
    const newErrors: newError = {};
    if (!categoria.nombre.trim()) {
      newErrors.nombre = "El nombre de la categoría es requerido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <PlusCircle className="mr-2" />
            Crear Nueva Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Categoría</Label>
              <Input
                id="nombre"
                name="nombre"
                value={categoria.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: T-shirt"
                aria-describedby="nombre-error"
              />
              {errors.nombre && (
                <p
                  id="nombre-error"
                  className="text-sm text-destructive flex items-center mt-1"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nombre}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Crear Categoría
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <PlusCircle className="mr-2" />
            Categorías Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <ul
              className="space-y-4"
              role="list"
              aria-label="Lista de categorías"
            >
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex justify-between items-center bg-muted p-4 rounded-md"
                >
                  <span className="font-bold font-mono">{category.nombre}</span>
                  <div className="space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            onClick={() => openModal(category)}
                            aria-label={`Editar categoría ${category.nombre}`}
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar categoría</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => openConfirmDialog(category.id)}
                            aria-label={`Eliminar categoría ${category.nombre}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar categoría</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pencil className="mr-2" />
              Editar Categoría
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                value={categoria.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: T-shirt"
                aria-describedby="edit-nombre-error"
              />
              {errors.nombre && (
                <p
                  id="edit-nombre-error"
                  className="text-sm text-destructive flex items-center mt-1"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nombre}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center">
              <AlertCircle className="mr-2 text-destructive" />
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          <p className="text-center">
            ¿Estás seguro que quieres eliminar esta categoría? Será eliminada de
            todos los productos donde fue referenciada.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={closeConfirmDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

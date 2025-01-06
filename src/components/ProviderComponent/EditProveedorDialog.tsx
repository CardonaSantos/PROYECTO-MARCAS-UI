import { useState, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ProviderManage } from "@/Utils/Types2/ProviderManage";

interface Props {
  proveedor: ProviderManage;
  isOpen: boolean;
  onClose: () => void;
}

const EditProveedorDialog: React.FC<Props> = ({
  proveedor,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProviderManage>(proveedor);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica para actualizar el proveedor
    onClose(); // Cerrar al guardar cambios
  };
  console.log("La data del nuevo provider a editar es: ", formData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay onClick={onClose} /> {/* Cierra al hacer clic afuera */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Guardar cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProveedorDialog;

import { ProviderManage } from "@/Utils/Types2/ProviderManage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../ui/dialog";

interface DeleteConfirmDialogProps {
  proveedor: ProviderManage | null; // Tipo del proveedor, puede ser null si no hay proveedor seleccionado
  isOpen: boolean; // Controla si el diálogo está abierto o cerrado
  onClose: () => void; // Función para cerrar el diálogo
  onConfirm: () => void; // Función que se llama cuando el usuario confirma la eliminación
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  proveedor,
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay onClick={onClose} /> {/* Cierra al hacer clic afuera */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Proveedor</DialogTitle>
        </DialogHeader>
        <p>
          ¿Estás seguro de que deseas eliminar al proveedor {proveedor?.nombre}?
        </p>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} variant="destructive">
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;

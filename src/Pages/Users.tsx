import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserCog } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL;

function Users() {
  const [users, setUsers] = useState<UsersSystem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsersSystem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UsersSystem | null>(null);
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);

  const [contrasenaActual, setContrasenaActual] = useState<string>("");

  const [editedUser, setEditedUser] = useState({
    nombre: "",
    correo: "",
    rol: "",
    contrasenaActualizar: "",
  }); // Formulario de edición

  const getUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No hay usuarios en este momento");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Maneja la edición del usuario
  // Maneja la edición del usuario
  const handleEditClick = (user: UsersSystem) => {
    setUserToEdit(user);
    setEditedUser({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      contrasenaActualizar: "",
    });
    setIsUserActive(user.activo); // Aquí se guarda el estado activo
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: UsersSystem) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/${userToDelete?.id}`
      );
      if (response.status === 200) {
        toast.success("Usuario eliminado exitosamente");
        setTimeout(() => {
          getUsers();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al eliminar usuario");
    }
    setShowConfirmModal(false);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.patch(`${API_URL}/users/${userToEdit?.id}`, {
        nombre: editedUser.nombre,
        correo: editedUser.correo,
        rol: editedUser.rol,
        // Solo envía la contraseña si existe una nueva
        contrasena: editedUser.contrasenaActualizar || undefined,
        contrasenaActual: contrasenaActual || undefined,
        activo: isUserActive,
      });
      console.log("La data enviada es:");

      console.log({
        nombre: editedUser.nombre,
        correo: editedUser.correo,
        contrasena: editedUser.contrasenaActualizar || "", // Nueva contraseña
        contrasenaActual: contrasenaActual, // Contraseña actual
        rol: editedUser.rol,
      });
      console.log("El id del usuari  a editar es:", userToEdit?.id);

      if (response.status === 200) {
        setShowEditModal(false);
        getUsers(); // Refrescar la lista de usuarios}
        setContrasenaActual("");
        toast.success("Usuario actualizado, cierre sesion e inicie de nuevo");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al actualizar usuario. Verifique las credenciales");
    }
  };

  console.log("El usuario a editar es: ", editedUser);
  console.log(
    "La contraseña actual del usuario a editar es: ",
    contrasenaActual
  );

  return (
    <div className="container mx-auto p-6">
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Gestión de Usuarios
          </CardTitle>
          <UserCog className="h-6 w-6 text-gray-500" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de usuario</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>{user.rol}</TableCell>
                  <TableCell>{user.activo ? "Activo" : "Inactivo"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {userToDelete?.nombre}?
              Todos los registros del usuario relacionado podrían alterarse y
              generar huecos de información.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={editedUser.nombre}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, nombre: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Correo
              </Label>
              <Input
                id="email"
                value={editedUser.correo}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, correo: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select
                onValueChange={(value) =>
                  setEditedUser({ ...editedUser, rol: value })
                }
                defaultValue={editedUser.rol}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select
                onValueChange={(value) => setIsUserActive(value === "true")}
                defaultValue={isUserActive ? "true" : "false"}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentPassword" className="text-right">
                Contraseña Actual
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                Nueva Contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={editedUser.contrasenaActualizar}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    contrasenaActualizar: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;

export interface User {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  creadoEn: string;
  actualizadoEn: string;
  activo: boolean;
}

export type UsersSystem = User;

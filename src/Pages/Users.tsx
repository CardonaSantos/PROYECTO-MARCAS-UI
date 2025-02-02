import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Save,
  Trash2,
  User,
  UserCog,
  X,
} from "lucide-react";
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
import { useStore } from "@/Context/ContextSucursal";

const API_URL = import.meta.env.VITE_API_URL;

function Users() {
  const userId = useStore((state) => state.userId) ?? 0;
  const [users, setUsers] = useState<UsersSystem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsersSystem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UsersSystem | null>(null);
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);

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
        activo: isUserActive,
        userId: userId, // ID del admin que edita
      });

      if (response.status === 200) {
        setShowEditModal(false);
        getUsers(); // Refrescar la lista de usuarios
        toast.success("Usuario actualizado correctamente.");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Error al actualizar usuario.");
    }
  };

  const [showPassword, setShowPassword] = useState({
    admin: false,
    user: false,
  });

  const [openChangePass, setOpenChangePass] = useState(false);
  const [contraseñaAdmin, setContraseñaAdmin] = useState("");
  const [userChangePasswordID, setUserChangePasswordID] = useState(0);
  const [newUserPass, setNewUserPass] = useState("");

  const handleChangePasswordUser = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/users/change-password/${userChangePasswordID}`,
        {
          adminId: userId, // ID del admin
          adminPassword: contraseñaAdmin, // Contraseña del admin
          newPassword: newUserPass.trim(), // Nueva contraseña del usuario
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Contraseña cambiada correctamente.");
        getUsers();
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error al cambiar la contraseña.");
    }
  };

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
                <TableHead>Editar</TableHead>
                <TableHead>Contraseñas</TableHead>
                <TableHead>Eliminar</TableHead>
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
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpenChangePass(true);
                        setUserChangePasswordID(user.id);
                      }}
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Contraseña
                    </Button>
                  </TableCell>

                  <TableCell>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              <UserCog className="inline-block mr-2 h-5 w-5" />
              Editar Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="name"
                  value={editedUser.nombre}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, nombre: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Ingrese el nombre"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  value={editedUser.correo}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, correo: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Ingrese el correo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Rol
              </Label>
              <Select
                onValueChange={(value) =>
                  setEditedUser({ ...editedUser, rol: value })
                }
                defaultValue={editedUser.rol}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openChangePass} onOpenChange={setOpenChangePass}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              <Lock className="inline-block mr-2 h-5 w-5" />
              Cambiar contraseña de Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Contraseña de Administrador
              </Label>
              <div className="relative">
                <Input
                  placeholder="Ingrese su contraseña"
                  id="currentPassword"
                  type={showPassword.admin ? "text" : "password"}
                  value={contraseñaAdmin}
                  onChange={(e) => setContraseñaAdmin(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      admin: !showPassword.admin,
                    })
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword.admin ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.user ? "text" : "password"}
                  placeholder="Ingrese la nueva contraseña del usuario"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      user: !showPassword.user,
                    })
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword.user ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setOpenChangePass(false)}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleChangePasswordUser}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
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

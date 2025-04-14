"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/Context/ContextSucursal";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCog,
  Edit,
  Trash2,
  Key,
  User,
  Mail,
  X,
  Save,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export interface UsersSystem {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  creadoEn: string;
  actualizadoEn: string;
  activo: boolean;
}

function Users() {
  const userId = useStore((state) => state.userId) ?? 0;
  const [users, setUsers] = useState<UsersSystem[]>([]);
  const [loading, setLoading] = useState(false);

  // Delete user state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsersSystem | null>(null);

  // Edit user state
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UsersSystem | null>(null);
  const [isUserActive, setIsUserActive] = useState<boolean>(true);
  const [editedUser, setEditedUser] = useState({
    nombre: "",
    correo: "",
    rol: "",
    contrasenaActualizar: "",
  });

  // Password change state
  const [openChangePass, setOpenChangePass] = useState(false);
  const [contraseñaAdmin, setContraseñaAdmin] = useState("");
  const [userChangePasswordID, setUserChangePasswordID] = useState(0);
  const [newUserPass, setNewUserPass] = useState("");
  const [showPassword, setShowPassword] = useState({
    admin: false,
    user: false,
  });

  // Fetch users data
  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Handle edit user
  const handleEditClick = (user: UsersSystem) => {
    setUserToEdit(user);
    setEditedUser({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      contrasenaActualizar: "",
    });
    setIsUserActive(user.activo);
    setShowEditModal(true);
  };

  // Handle delete user
  const handleDeleteClick = (user: UsersSystem) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  // Confirm delete user
  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/users/${userToDelete?.id}`
      );
      if (response.status === 200) {
        toast.success("Usuario eliminado exitosamente");
        getUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  // Save edited user
  const handleSaveEdit = async () => {
    // Validate form
    if (
      !editedUser.nombre.trim() ||
      !editedUser.correo.trim() ||
      !editedUser.rol
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.correo)) {
      toast.error("Por favor ingrese un correo electrónico válido");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/users/${userToEdit?.id}`, {
        nombre: editedUser.nombre,
        correo: editedUser.correo,
        rol: editedUser.rol,
        activo: isUserActive,
        userId: userId,
      });

      if (response.status === 200) {
        toast.success("Usuario actualizado correctamente");
        getUsers();
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  // Change user password
  const handleChangePasswordUser = async () => {
    // Validate form
    if (!contraseñaAdmin.trim() || !newUserPass.trim()) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (newUserPass.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/users/change-password/${userChangePasswordID}`,
        {
          adminId: userId,
          adminPassword: contraseñaAdmin.trim(),
          newPassword: newUserPass.trim(),
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Contraseña cambiada correctamente");
        handleClosePasswordModal();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        "Error al cambiar la contraseña. Verifique su contraseña de administrador."
      );
    } finally {
      setLoading(false);
    }
  };

  // Close modals and reset state
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditedUser({
      nombre: "",
      correo: "",
      rol: "",
      contrasenaActualizar: "",
    });
  };

  const handleClosePasswordModal = () => {
    setOpenChangePass(false);
    setContraseñaAdmin("");
    setNewUserPass("");
    setUserChangePasswordID(0);
    setShowPassword({
      admin: false,
      user: false,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="shadow-md border-0 bg-background">
        <CardHeader className="flex flex-row items-center justify-between bg-background rounded-t-lg border-b">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={getUsers}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Usuario</TableHead>
                  <TableHead className="font-semibold">Correo</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-center">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                      <span className="mt-2 block">Cargando usuarios...</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {user.nombre}
                      </TableCell>
                      <TableCell>{user.correo}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.rol === "ADMIN" ? "default" : "outline"}
                          className="flex w-fit items-center gap-1"
                        >
                          {user.rol === "ADMIN" && (
                            <Shield className="h-3 w-3" />
                          )}
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.activo ? "default" : "destructive"}
                          className="w-fit"
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(user)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOpenChangePass(true);
                              setUserChangePasswordID(user.id);
                            }}
                            className="h-8 px-2"
                          >
                            <Key className="h-3.5 w-3.5 mr-1" />
                            Contraseña
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            className="h-8 px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
          setShowConfirmModal(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-semibold">{userToDelete?.nombre}</span>?
              <p className="mt-2 text-destructive font-medium">
                Todos los registros del usuario relacionado podrían alterarse y
                generar huecos de información.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          if (!open) handleCloseEditModal();
          setShowEditModal(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
              <UserCog className="h-5 w-5" />
              Editar Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
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
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleCloseEditModal}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePass}
        onOpenChange={(open) => {
          if (!open) handleClosePasswordModal();
          setOpenChangePass(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Cambiar contraseña de Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
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
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleClosePasswordModal}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleChangePasswordUser}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Building,
  FileText,
  Globe,
  IdCard,
  LocateIcon,
  Mail,
  MapPin,
  MapPinHouse,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL;

interface Provider {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  razonSocial: string;
  rfc: string;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  pais: string;
  ciudad: string;
  codigoPostal: string;
  notas: string;
  activo: boolean;
}

export default function CrearProveedor() {
  const [newProvider, setNewProvider] = useState<Provider>({
    id: 0,
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    razonSocial: "",
    rfc: "",
    nombreContacto: "",
    telefonoContacto: "",
    emailContacto: "",
    pais: "",
    ciudad: "",
    codigoPostal: "",
    notas: "",
    activo: false,
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/provider`);
      setProviders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los proveedores");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProvider((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/provider`, newProvider);
      toast.success("Proveedor creado exitosamente");
      setNewProvider({
        id: 0,
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        razonSocial: "",
        rfc: "",
        nombreContacto: "",
        telefonoContacto: "",
        emailContacto: "",
        pais: "",
        ciudad: "",
        codigoPostal: "",
        notas: "",
        activo: false,
      });
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el proveedor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedProvider) return;
    setIsLoading(true);
    try {
      await axios.patch(
        `${API_URL}/provider/${selectedProvider.id}`,
        selectedProvider
      );
      toast.success("Proveedor actualizado exitosamente");
      setSelectedProvider(null);
      setIsEditDialogOpen(false);
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el proveedor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProvider) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/provider/${selectedProvider.id}`);
      toast.success("Proveedor eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el proveedor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="create" className="space-y-4">
      <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2">
        <TabsTrigger value="create">Crear Proveedor</TabsTrigger>
        <TabsTrigger value="list">Lista de Proveedores</TabsTrigger>
      </TabsList>
      <TabsContent value="create">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <h2 className="text-lg font-semibold">Crear Proveedor</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <Input
                  id="nombre"
                  name="nombre"
                  value={newProvider.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del proveedor"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <Input
                  id="correo"
                  name="correo"
                  value={newProvider.correo}
                  onChange={handleInputChange}
                  placeholder="Correo electrónico"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <Input
                  id="telefono"
                  name="telefono"
                  value={newProvider.telefono}
                  onChange={handleInputChange}
                  placeholder="Teléfono"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <Input
                  id="direccion"
                  name="direccion"
                  value={newProvider.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-500" />
                <Input
                  id="razonSocial"
                  name="razonSocial"
                  value={newProvider.razonSocial}
                  onChange={handleInputChange}
                  placeholder="Razón social"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <IdCard className="w-5 h-5 text-gray-500" />
                <Input
                  id="rfc"
                  name="rfc"
                  value={newProvider.rfc}
                  onChange={handleInputChange}
                  placeholder="RFC"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <Input
                  id="nombreContacto"
                  name="nombreContacto"
                  value={newProvider.nombreContacto || ""}
                  onChange={handleInputChange}
                  placeholder="Nombre de contacto"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <Input
                  id="telefonoContacto"
                  name="telefonoContacto"
                  value={newProvider.telefonoContacto || ""}
                  onChange={handleInputChange}
                  placeholder="Teléfono de contacto"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <Input
                  id="emailContacto"
                  name="emailContacto"
                  value={newProvider.emailContacto || ""}
                  onChange={handleInputChange}
                  placeholder="Correo de contacto"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <Input
                  id="pais"
                  name="pais"
                  value={newProvider.pais || ""}
                  onChange={handleInputChange}
                  placeholder="País"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <LocateIcon className="w-5 h-5 text-gray-500" />
                <Input
                  id="ciudad"
                  name="ciudad"
                  value={newProvider.ciudad || ""}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPinHouse className="w-5 h-5 text-gray-500" />
                <Input
                  id="codigoPostal"
                  name="codigoPostal"
                  value={newProvider.codigoPostal || ""}
                  onChange={handleInputChange}
                  placeholder="Código postal"
                  className="w-full"
                />
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-gray-500 mt-2" />
                <Textarea
                  id="notas"
                  name="notas"
                  value={newProvider.notas || ""}
                  onChange={handleInputChange}
                  placeholder="Notas"
                  className="w-full"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Guardando..." : "Crear Proveedor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <h2 className="text-lg font-semibold">Lista de Proveedores</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {providers.map((provider) => (
                <li
                  key={provider.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="space-y-1 mb-2 md:mb-0">
                    <p className="font-semibold text-lg">{provider.nombre}</p>
                    <p className="text-sm text-gray-600">
                      <Mail className="w-4 h-4 inline-block mr-1" />
                      {provider.correo || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Phone className="w-4 h-4 inline-block mr-1" />
                      {provider.telefono || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <MapPin className="w-4 h-4 inline-block mr-1" />
                      {provider.direccion || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <FileText className="w-4 h-4 inline-block mr-1" />
                      RFC: {provider.rfc || "N/A"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedProvider(provider);
                        setIsEditDialogOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {/* <DialogContent className="max-w-md"> */}
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <h3 className="text-lg font-semibold">Editar Proveedor</h3>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <Input
                id="nombre"
                name="nombre"
                value={selectedProvider?.nombre || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Nombre del proveedor"
                required
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <Input
                id="correo"
                name="correo"
                value={selectedProvider?.correo || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Correo electrónico"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <Input
                id="telefono"
                name="telefono"
                value={selectedProvider?.telefono || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Teléfono"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <Input
                id="direccion"
                name="direccion"
                value={selectedProvider?.direccion || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Dirección"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-500" />
              <Input
                id="razonSocial"
                name="razonSocial"
                value={selectedProvider?.razonSocial || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Razón social"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <IdCard className="w-5 h-5 text-gray-500" />
              <Input
                id="rfc"
                name="rfc"
                value={selectedProvider?.rfc || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="RFC"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <Input
                id="nombreContacto"
                name="nombreContacto"
                value={selectedProvider?.nombreContacto || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Nombre de contacto"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <Input
                id="telefonoContacto"
                name="telefonoContacto"
                value={selectedProvider?.telefonoContacto || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Teléfono de contacto"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <Input
                id="emailContacto"
                name="emailContacto"
                value={selectedProvider?.emailContacto || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Correo de contacto"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <Input
                id="pais"
                name="pais"
                value={selectedProvider?.pais || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="País"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LocateIcon className="w-5 h-5 text-gray-500" />
              <Input
                id="ciudad"
                name="ciudad"
                value={selectedProvider?.ciudad || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Ciudad"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <MapPinHouse className="w-5 h-5 text-gray-500" />
              <Input
                id="codigoPostal"
                name="codigoPostal"
                value={selectedProvider?.codigoPostal || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Código postal"
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="activo">Activo</Label>
              <Switch
                id="activo"
                checked={selectedProvider?.activo || false}
                onCheckedChange={(checked) =>
                  setSelectedProvider((prev) => ({ ...prev!, activo: checked }))
                }
              />
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="w-5 h-5 text-gray-500 mt-2" />
              <Textarea
                id="notas"
                name="notas"
                value={selectedProvider?.notas || ""}
                onChange={(e) =>
                  setSelectedProvider((prev) => ({
                    ...prev!,
                    [e.target.name]: e.target.value,
                  }))
                }
                placeholder="Notas"
                className="w-full"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Actualizando..." : "Actualizar Proveedor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
          </DialogHeader>
          <p>¿Estás seguro que deseas eliminar a {selectedProvider?.nombre}?</p>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

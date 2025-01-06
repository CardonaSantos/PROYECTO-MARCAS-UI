import { ProviderManage } from "@/Utils/Types2/ProviderManage"; // Importa el tipo adecuado
import { Button } from "../ui/button";
import {
  AlignLeft,
  Building,
  Edit,
  Globe,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";

interface ProveedoresListProps {
  proveedores: ProviderManage[]; // Un array de proveedores
  onEdit: (proveedor: ProviderManage) => void; // Función que se llama al editar un proveedor
  onDelete: (proveedor: ProviderManage) => void; // Función que se llama al eliminar un proveedor
}

const ProveedoresList: React.FC<ProveedoresListProps> = ({
  proveedores,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
      {proveedores.map((proveedor) => (
        <div
          key={proveedor.id}
          className="p-4 shadow-xl rounded-lg flex flex-col justify-between space-y-2 border-2"
        >
          <div>
            <h3 className="text-lg font-semibold">{proveedor.nombre}</h3>
            <p className="text-sm flex items-center">
              <Mail className="mr-2" />
              Correo: {proveedor.correo}
            </p>
            <p className="text-sm flex items-center">
              <Phone className="mr-2" />
              Teléfono: {proveedor.telefono}
            </p>
            <p className="text-sm flex items-center">
              <MapPin className="mr-2" />
              Dirección: {proveedor.direccion}
            </p>
            <p className="text-sm flex items-center">
              <Building className="mr-2" />
              Razón Social: {proveedor.razonSocial}
            </p>
            <p className="text-sm flex items-center">
              <AlignLeft className="mr-2" />
              RFC: {proveedor.rfc}
            </p>
            <p className="text-sm flex items-center">
              <Phone className="mr-2" />
              Nombre del Contacto: {proveedor.nombreContacto}
            </p>
            <p className="text-sm flex items-center">
              <Phone className="mr-2" />
              Teléfono del Contacto: {proveedor.telefonoContacto}
            </p>
            <p className="text-sm flex items-center">
              <Mail className="mr-2" />
              Email del Contacto: {proveedor.emailContacto}
            </p>
            <p className="text-sm flex items-center">
              <Globe className="mr-2" />
              País: {proveedor.pais}
            </p>
            <p className="text-sm flex items-center">
              <Globe2 className="mr-2" />
              Ciudad: {proveedor.ciudad}
            </p>
            <p className="text-sm flex items-center">
              <MapPin className="mr-2" />
              Código Postal: {proveedor.codigoPostal}
            </p>
            {proveedor.latitud && proveedor.longitud ? (
              <p className="text-sm flex items-center">
                <MapPin className="mr-2" />
                <a
                  href={`https://www.google.com/maps?q=${proveedor.latitud},${proveedor.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ubicación
                </a>
              </p>
            ) : (
              <p className="text-sm flex items-center">
                <MapPin className="mr-2" />
                Ubicación no guardada
              </p>
            )}

            <p className="text-sm flex items-center">
              <AlignLeft className="mr-2" />
              Notas: {proveedor.notas}
            </p>
            <p className="text-sm flex items-center">
              <AlignLeft className="mr-2" />
              Creado En: {new Date(proveedor.creadoEn).toLocaleDateString()}
            </p>
            <p className="text-sm flex items-center">
              <AlignLeft className="mr-2" />
              Actualizado En:{" "}
              {new Date(proveedor.actualizadoEn).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => onEdit(proveedor)}
              className="flex items-center"
            >
              <Edit className="mr-2" /> Editar
            </Button>
            <Button
              onClick={() => onDelete(proveedor)}
              variant="destructive"
              className="flex items-center"
            >
              <Trash2 className="mr-2" /> Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProveedoresList;

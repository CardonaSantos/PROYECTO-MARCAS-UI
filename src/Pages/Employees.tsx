import { useState, useEffect } from "react";
import { Clock, User } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/Context/SocketProvider ";
//-------------------------------------------------
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import React, { useCallback, useMemo } from "react";

import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

interface Asistencia {
  entrada: string; // fecha de entrada
  salida: string | null; // puede ser null si aún no ha salido
}

interface Prospecto {
  estado: Estado;
  inicio: string;
  nombreCompleto: string;
  apellido: string;
  empresaTienda: string;
}

interface Usuario {
  nombre: string;
  id: number;
  rol: Rol;
  prospecto: Prospecto | null; // Puede ser null
  asistencia: Asistencia | null; // Puede ser null
}

interface LocationReceived {
  latitud: number;
  longitud: number;
  usuarioId: number;
  usuario: Usuario;
  timestamp: string; // Timestamp de la ubicación
}

enum Rol {
  ADMIN = "ADMIN",
  VENDEDOR = "VENDEDOR",
}

enum Estado {
  EN_PROSPECTO = "EN_PROSPECTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}

interface Asistencia {
  entrada: string; // fecha de entrada
  salida: string | null; // puede ser null si aún no ha salido
}

interface Prospecto {
  estado: Estado;
  inicio: string;
  nombreCompleto: string;
  apellido: string;
  empresaTienda: string;
}
interface Visita {
  id: number; // ID de la visita
  inicio: string; // Fecha de inicio de la visita
  cliente: {
    nombre: string; // Nombre del cliente asociado a la visita
    apellido: string; // Apellido del cliente asociado
  };
  motivoVisita: string | null; // Motivo de la visita, puede ser null
  tipoVisita: string | null; // Tipo de visita, puede ser null
}

interface Usuario {
  nombre: string;
  id: number;
  rol: Rol;
  prospecto: Prospecto | null; // Puede ser null
  visita: Visita | null;
  asistencia: Asistencia | null; // Puede ser null
}

interface LocationReceived {
  latitud: number;
  longitud: number;
  usuarioId: number;
  usuario: Usuario;
  timestamp: string; // Timestamp de la ubicación
}

// Datos de ejemplo (en una aplicación real, estos vendrían de una API)
const Employees: React.FC = () => {
  const socket = useSocket();
  const [locations, setLocations] = useState<LocationReceived[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationReceived | null>(null);
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState({
    lat: 15.6646,
    lng: -91.7121,
  });
  const [isManualCenter, setIsManualCenter] = useState(false);

  // Escuchar ubicaciones desde el socket
  useEffect(() => {
    if (socket) {
      const locationListener = (locationData: LocationReceived) => {
        setLocations((prevLocations) => {
          const existingIndex = prevLocations.findIndex(
            (loc) => loc.usuarioId === locationData.usuarioId
          );
          if (existingIndex !== -1) {
            const updatedLocations = [...prevLocations];
            updatedLocations[existingIndex] = locationData;
            return updatedLocations;
          }
          return [...prevLocations, locationData];
        });

        // Solo actualiza el centro si no es manual
        if (!isManualCenter && locations.length === 0) {
          setCurrentCenter({
            lat: locationData.latitud,
            lng: locationData.longitud,
          });
        }
      };

      socket.on("receiveLocation", locationListener);

      return () => {
        socket.off("receiveLocation", locationListener);
      };
    }
  }, [socket, isManualCenter, locations]);

  const mapContainerStyle = useMemo(
    () => ({ height: "100%", width: "100%" }),
    []
  );

  const mapOptions = useMemo(
    () => ({
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  );

  const handleMarkerClick = useCallback((location: LocationReceived) => {
    setSelectedLocation(location);
    setIsInfoWindowOpen(true);
  }, []);

  const closeInfoWindow = useCallback(() => {
    setSelectedLocation(null);
    setIsInfoWindowOpen(false);
  }, []);

  const handleMapDrag = useCallback(() => {
    setIsManualCenter(true);
  }, []);

  const handleMapClick = useCallback(() => {
    setIsManualCenter(true);
    setIsInfoWindowOpen(false);
    setSelectedLocation(null);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD_hzrV-YS5EaHDm-UK3jL0ny6gsJoj_18",
  });

  if (loadError) return <div>Error cargando el mapa.</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  const InfoWindowContent: React.FC<{ location: LocationReceived }> = ({
    location,
  }) => {
    const { usuario } = location;
    const { prospecto, visita } = usuario;

    return (
      <div className="bg-white p-2 rounded-lg shadow-md max-w-[250px] text-xs">
        <h2 className="text-sm font-bold mb-1 text-gray-800">
          {usuario.nombre}
        </h2>
        <p className="text-gray-600 mb-1">Rol: {usuario.rol}</p>

        {usuario.asistencia?.entrada ? (
          <p className="text-green-600 mb-1">
            Asistencia registrada: {formatearFecha(usuario.asistencia.entrada)}
          </p>
        ) : (
          <p className="text-red-600 mb-1">Sin registro de asistencia</p>
        )}

        {prospecto && (
          <div className="mt-2 border-t pt-1">
            <h3 className="text-sm font-semibold mb-1 text-gray-700">
              Prospecto
            </h3>
            <p className="text-gray-600">
              Nombre:{" "}
              {`${prospecto.nombreCompleto} ${prospecto.apellido || ""}`}
            </p>
            <p className="text-gray-600">
              Empresa: {prospecto.empresaTienda || "Desconocida"}
            </p>
            <p className="text-gray-600">
              Inicio: {formatearFecha(prospecto.inicio)}
            </p>
          </div>
        )}

        {visita && (
          <div className="mt-2 border-t pt-1">
            <h3 className="text-sm font-semibold mb-1 text-gray-700">
              Visita en curso
            </h3>
            <p className="text-gray-600">
              Cliente:{" "}
              {`${visita.cliente.nombre} ${visita.cliente.apellido || ""}`}
            </p>
            <p className="text-gray-600">
              Motivo: {visita.motivoVisita || "Sin motivo especificado"}
            </p>
            <p className="text-gray-600">
              Inicio: {formatearFecha(visita.inicio)}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Seguimiento de Empleados</h1>

      {/* Mapa */}
      <Card className="mt-8 shadow-xl">
        <CardHeader>
          <CardTitle>Empleados Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 relative overflow-hidden">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={currentCenter}
              options={mapOptions}
              onDragStart={handleMapDrag}
              onClick={handleMapClick}
            >
              {locations.map((location) => (
                <Marker
                  key={location.usuarioId}
                  position={{ lat: location.latitud, lng: location.longitud }}
                  onClick={() => handleMarkerClick(location)}
                />
              ))}

              {selectedLocation && isInfoWindowOpen && (
                <InfoWindow
                  position={{
                    lat: selectedLocation.latitud,
                    lng: selectedLocation.longitud,
                  }}
                  onCloseClick={closeInfoWindow}
                >
                  <InfoWindowContent location={selectedLocation} />
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableCaption>Lista de empleados y su estado actual</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Ahora</TableHead>
            {/* <TableHead>Acciones</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((loc, index) => (
            <TableRow key={index}>
              <TableCell>{loc.usuario.nombre}</TableCell>

              <TableCell>
                <Badge
                  variant="default"
                  className={
                    "bg-green-500 text-white" // Para "Activo"
                  }
                >
                  Activo
                </Badge>
              </TableCell>
              <TableCell>
                <Clock className="w-4 h-4 inline mr-1" />
                {loc.usuario.asistencia?.entrada
                  ? formatearFecha(loc.usuario.asistencia.entrada)
                  : "Entrada no registrada"}
              </TableCell>
              <TableCell>
                <Clock className="w-4 h-4 inline mr-1" />
                {loc.usuario.asistencia?.salida
                  ? new Date(loc.usuario.asistencia.salida).toLocaleString()
                  : "En progreso"}
              </TableCell>

              <TableCell>
                <User className="w-4 h-4 inline mr-1" />
                {loc.usuario.prospecto?.nombreCompleto &&
                loc.usuario.prospecto?.empresaTienda
                  ? `${loc.usuario.prospecto.nombreCompleto} - ${loc.usuario.prospecto.empresaTienda}`
                  : "Sin actividad"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Employees;

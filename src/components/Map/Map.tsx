import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import React, { useCallback, useMemo, useState } from "react";

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

interface MyGoogleMapProps {
  locations: LocationReceived[];
}

interface InfoWindowContentProps {
  location: LocationReceived;
}

export const InfoWindowContent: React.FC<InfoWindowContentProps> = ({
  location,
}) => {
  const { usuario } = location;
  const { prospecto } = usuario;

  return (
    <div className="bg-white p-2 rounded-lg shadow-md max-w-[250px] text-xs">
      <h2 className="text-sm font-bold mb-1 text-gray-800">{usuario.nombre}</h2>
      <p className="text-gray-600 mb-1">Rol: {usuario.rol}</p>

      {usuario.asistencia?.entrada ? (
        <p className="text-green-600 mb-1">
          Asistencia registrada {formatearFecha(usuario.asistencia.entrada)}
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
            Nombre: {`${prospecto.nombreCompleto} ${prospecto.apellido || ""}`}
          </p>
          <p className="text-gray-600">
            Empresa: {prospecto.empresaTienda || "Desconocida"}
          </p>
          <p className="text-gray-600">
            Inicio: {formatearFecha(prospecto.inicio)}
          </p>
        </div>
      )}
    </div>
  );
};

const MyGoogleMap: React.FC<MyGoogleMapProps> = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationReceived | null>(null);
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD_hzrV-YS5EaHDm-UK3jL0ny6gsJoj_18",
  });

  const mapContainerStyle = useMemo(
    () => ({
      height: "100%",
      width: "100%",
    }),
    []
  );

  const center = useMemo(() => {
    if (locations.length > 0) {
      const firstLocation = locations[0];
      return { lat: firstLocation.latitud, lng: firstLocation.longitud };
    }
    return { lat: 15.6646, lng: -91.7121 };
  }, [locations]);

  const mapOptions = useMemo(
    () => ({
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_LEFT,
      },
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  );

  const onMapClick = useCallback(() => {
    setIsInfoWindowOpen(false);
    setSelectedLocation(null);
  }, []);

  const handleMarkerClick = useCallback((location: LocationReceived) => {
    setSelectedLocation(location);
    setIsInfoWindowOpen(true);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={13}
      center={center}
      options={mapOptions}
      onClick={onMapClick}
    >
      {locations.map((location) => {
        if (!location.latitud || !location.longitud) {
          console.error("Ubicación inválida:", location);
          return null;
        }

        return (
          <Marker
            key={location.usuarioId}
            position={{ lat: location.latitud, lng: location.longitud }}
            onClick={() => handleMarkerClick(location)}
          />
        );
      })}

      {selectedLocation && isInfoWindowOpen && (
        <InfoWindow
          position={{
            lat: selectedLocation.latitud,
            lng: selectedLocation.longitud,
          }}
          onCloseClick={() => {
            setIsInfoWindowOpen(false);
            setSelectedLocation(null);
          }}
        >
          <InfoWindowContent location={selectedLocation} />
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(MyGoogleMap);

// export default MyGoogleMap;

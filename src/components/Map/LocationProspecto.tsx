import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

interface LocationReceived {
  id: number;
  latitud: number;
  longitud: number;
}

interface Location {
  locations: LocationReceived;
}

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

const LocationProspecto = ({ locations }: Location) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD_hzrV-YS5EaHDm-UK3jL0ny6gsJoj_18", // Tu API Key
  });

  const [selectedLocation, setSelectedLocation] =
    useState<LocationReceived | null>(null);
  console.log(selectedLocation);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  console.log("Las localizaciones son: ", locations);
  console.log("Latitud: ", locations.latitud, "Longitud: ", locations.longitud);

  // Centra el mapa en la ubicación del prospecto
  const center = {
    lat: locations.latitud,
    lng: locations.longitud,
  };

  const mapOptions = {
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: window.google.maps.ControlPosition.TOP_LEFT,
    },
    streetViewControl: false,
    fullscreenControl: true,
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={15} // Ajusta el zoom
      center={center}
      options={mapOptions}
    >
      {/* Marker usando las coordenadas que llegan como prop */}
      <Marker
        key={locations.id}
        position={{ lat: locations.latitud, lng: locations.longitud }}
        onClick={() => setSelectedLocation(locations)}
      />
    </GoogleMap>
  );
};

export default LocationProspecto;

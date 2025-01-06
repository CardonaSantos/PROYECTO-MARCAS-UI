export interface VentaTypePDF {
  id: number;
  timestamp: string; // Fecha y hora en formato ISO
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: "CONTADO" | "TARJETA" | "TRANSFERENCIA_BANCO"; // Enum de métodos de pago
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    direccion: string;
  };
  vendedor: {
    id: number;
    nombre: string;
    correo: string;
  };
  productos: {
    cantidad: number;
    precio: number;
    producto: {
      id: number;
      nombre: string;
      descripcion: string;
    };
  }[];
}

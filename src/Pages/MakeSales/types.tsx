export interface Imagen {
  id: number;
  url: string;
  productoId: number;
  creadoEn: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  creadoEn: string;
  actualizadoEn: string;
  codigoProducto: string;
  stock: Stock | null;
  categorias: Category[];
  imagenes: Imagen[]; // Nueva propiedad
}

export interface Stock {
  id: number;
  productoId: number;
  cantidad: number;
  proveedorId: number;
  costo: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Category {
  categoria: Categoria1;
  creadoEn: string;
}

export interface Categoria1 {
  actualizadoEn: string;
  id: number;
  nombre: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: string;
  descuentos: Descuento[];
}

export interface Descuento {
  id: number;
  porcentaje: number;
  clienteId: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Cliente2 {
  actualizadoEn: string;
  correo: string;
  creadoEn: string;
  descuentos: Descuento[];
  direccion: string;
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface Visita2 {
  actualizadoEn: string;
  cliente: Cliente2;
  clienteId: number;
  creadoEn: string;
  estadoVisita: string;
  fin: string | null;
  id: number;
  inicio: string;
  motivoVisita: string;
  observaciones: string | null;
  tipoVisita: string;
  usuarioId: number;
  ventaId: number | null;
}

export type SaleData = {
  // Campos para ventas normales (obligatorios)
  monto: number;
  montoConDescuento: number;
  metodoPago: string;
  empresaId: number;
  descuento?: number;
  clienteId?: number;
  vendedorId?: number;
  productos: {
    productoId: number;
    cantidad: number;
    precio: number;
  }[];

  // Campos opcionales (solo necesarios si es CREDITO)
  creditoInicial?: number;
  numeroCuotas?: number;
  interes?: number;
  comentario?: string;
  diasEntrePagos?: number;
};

export type Venta = {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: "CONTADO" | "CREDITO"; // Agrega otros métodos de pago si existen
  timestamp: string; // ISO 8601 timestamp
  usuarioId: number;
  clienteId: number | null; // Puede ser `null`
  visitaId: number | null; // Puede ser `null`
  // productos: ProductoVenta[];
};
// Tipos para el estado de la información del crédito
export type CreditoInfo = {
  creditoInicial: number | null;
  numeroCuotas: number | null;
  interes: number | null;
  comentario: string | null;
  diasEntrePagos: number | null;
};

export interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}
export type CategoriaFiltrar = Categoria1;

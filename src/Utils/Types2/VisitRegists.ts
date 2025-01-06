interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
  departamentoId: number;
}

interface Cliente {
  id: number;
  nombre: string;
  comentarios: string;
  correo: string;
  creadoEn: string;
  actualizadoEn: string;
  departamento: Departamento;
  direccion: string;
  municipio: Municipio;
  telefono: string;
  categoriasInteres: any[];
  preferenciaContacto: string;
  presupuestoMensual: string;
  tipoCliente: string;
}

interface Venta {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: string;
  timestamp: string;
  usuarioId: number;
  clienteId: number;
  visitaId: number;
}

interface Vendedor {
  id: number;
  nombre: string;
  correo: string;
  creadoEn: string;
  rol: string;
}

interface Visita {
  id: number;
  inicio: string;
  fin: string | null;
  usuarioId: number;
  clienteId: number;
  observaciones: string | null;
  motivoVisita: string;
  tipoVisita: string;
  estadoVisita: string;
  creadoEn: string;
  actualizadoEn: string;
  cliente: Cliente;
  ventas: Venta[];
  vendedor: Vendedor;
}
export type VisitRegist = Visita;

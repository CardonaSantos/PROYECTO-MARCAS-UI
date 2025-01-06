type Cliente = {
  nombre: string;
  correo: string;
  telefono: string;
};

type Vendedor = {
  nombre: string;
  correo: string;
};

type Venta = {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number | null;
  metodoPago: string;
  timestamp: string;
  usuarioId: number;
  clienteId: number;
  visitaId: number | null;
  cliente: Cliente;
  vendedor: Vendedor;
  productos: Productos[];
};

interface Productos {
  id: number;
  cantidad: number;
  precio: number;
}

export type LastSales = Venta[];

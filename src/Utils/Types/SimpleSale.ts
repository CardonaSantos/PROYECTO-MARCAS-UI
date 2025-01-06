interface Venta {
  id: number;
  monto: number;
  montoConDescuento: number;
  descuento: number | null;
  metodoPago: MetodoPago;
  timestamp: string;
  usuarioId: number;
  clienteId: number;
  citaId: number | null;
  prospectoId: number | null;
}

enum MetodoPago {
  CONTADO,
  TARJETA,
  TRANSFERENCIA_BANCO,
}

export type SimpleSale = Venta[];

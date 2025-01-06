interface ClienteProspecto {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: string;
}

interface Prospecto {
  id: number;
  inicio: string;
  fin: string | null;
  usuarioId: number;
  clienteId: number;
  reporte: string | null;
  ventaId: number | null;
  creadoEn: string;
  actualizadoEn: string;
  cliente: ClienteProspecto;
}

// interface Prospecto2 {
//   id: number;
//   inicio: string;
//   fin: string | null;
//   usuarioId: number;
//   clienteId: number;
//   reporte: string | null;
//   ventaId: number | null;
//   creadoEn: string;
//   actualizadoEn: string;
//   cliente: ClienteProspecto;
// }

export type Prospect = Prospecto;

// export type Prospect2 = Prospecto2;

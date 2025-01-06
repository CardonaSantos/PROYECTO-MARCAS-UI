interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "VENDEDOR"; // Asegúrate de incluir todos los roles posibles.
}

interface Asistencia {
  id: number;
  fecha: string;
  entrada: string;
  salida?: string;
  usuarioId: number;
  creadoEn: string;
  usuario: Usuario;
  estado?: string; // Asegúrate de que esto refleje el estado que necesitas
}

export type Asistencias = Asistencia[];

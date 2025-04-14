import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");

export const formatearFecha = (fecha: string | undefined) => {
  let nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm:ss A");
  return nueva_fecha;
};

export const formatearMoneda = (cantidad: number | undefined): string => {
  if (cantidad === undefined) {
    return "N/A"; // Puedes devolver un valor predeterminado o manejarlo de otra forma
  }
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(cantidad);
};

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import logo from "../../../assets/images/logoEmpresa.png";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY hh:mm A");
};

// Registering a custom font
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
}

interface Empresa {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  pbx: string | null;
  email: string;
  website: string | null;
}

interface Credito {
  id: number;
  montoTotalConInteres: number;
  saldoPendiente: number;
  totalPagado: number;
  numeroCuotas: number;
  interes: number;
  fechaContrato: string;
  cliente: Cliente;
  empresa: Empresa;
}

interface CreditoPago {
  id: number;
  creditoId: number;
  monto: number;
  timestamp: string;
  metodoPago: string;
  credito: Credito;
}

interface CreditoProps {
  credito: CreditoPago;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 25,
    fontFamily: "Roboto",
  },
  section: {
    margin: 5,
    padding: 5,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "#3B82F6",
    textTransform: "uppercase",
  },
  subheader: {
    fontSize: 14,
    marginBottom: 7,
    color: "#4B5563",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#6B7280",
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    paddingTop: 10,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  logo: {
    width: 120,
    height: 70,
    marginBottom: 10,
    alignSelf: "center",
  },
  paymentConfirmation: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
  },
  paymentConfirmationText: {
    fontSize: 12,
    color: "#059669",
    textAlign: "center",
  },
});

function PDFpayment({ credito }: CreditoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.header}>Comprobante de Pago</Text>

        <View style={styles.section}>
          <Text style={styles.subheader}>Información de la Empresa</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{credito.credito.empresa.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>
              {credito.credito.empresa.direccion}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{credito.credito.empresa.telefono}</Text>
          </View>
          {credito.credito.empresa.pbx && (
            <View style={styles.row}>
              <Text style={styles.label}>PBX:</Text>
              <Text style={styles.value}>{credito.credito.empresa.pbx}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{credito.credito.empresa.email}</Text>
          </View>
          {credito.credito.empresa.website && (
            <View style={styles.row}>
              <Text style={styles.label}>Sitio web:</Text>
              <Text style={styles.value}>
                {credito.credito.empresa.website}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Información del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text
              style={styles.value}
            >{`${credito.credito.cliente.nombre} ${credito.credito.cliente.apellido}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>
              {credito.credito.cliente.direccion}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{credito.credito.cliente.telefono}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Detalles del Pago</Text>
          {/* <View style={styles.row}>
            <Text style={styles.label}>ID de Pago:</Text>
            <Text style={styles.value}>{credito.id}</Text>
          </View> */}
          <View style={styles.row}>
            <Text style={styles.label}>Monto Pagado:</Text>
            <Text style={styles.value}>{formatCurrency(credito.monto)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha y Hora:</Text>
            <Text style={styles.value}>
              {formatearFecha(credito.timestamp)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Método de Pago:</Text>
            <Text style={styles.value}>{credito.metodoPago}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Información del Crédito</Text>
          {/* <View style={styles.row}>
            <Text style={styles.label}>ID de Crédito:</Text>
            <Text style={styles.value}>{credito.credito.id}</Text>
          </View> */}
          <View style={styles.row}>
            <Text style={styles.label}>Monto Total con Interés:</Text>
            <Text style={styles.value}>
              {formatCurrency(credito.credito.montoTotalConInteres)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Saldo Pendiente:</Text>
            <Text style={styles.value}>
              {formatCurrency(credito.credito.saldoPendiente)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Pagado:</Text>
            <Text style={styles.value}>
              {formatCurrency(credito.credito.totalPagado)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Número de Cuotas:</Text>
            <Text style={styles.value}>{credito.credito.numeroCuotas}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Interés:</Text>
            <Text style={styles.value}>{`${credito.credito.interes}%`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Contrato:</Text>
            <Text style={styles.value}>
              {formatearFecha(credito.credito.fechaContrato)}
            </Text>
          </View>
        </View>

        {/* <View style={styles.paymentConfirmation}>
          <Text style={styles.paymentConfirmationText}>
            ¡Pago realizado con éxito! Gracias por su puntualidad.
          </Text>
        </View> */}

        <Text style={styles.footer}>
          Este comprobante es un documento oficial de su pago. Por favor,
          consérvelo para sus registros. Si tiene alguna pregunta, no dude en
          contactarnos.
        </Text>
      </Page>
    </Document>
  );
}

export default PDFpayment;

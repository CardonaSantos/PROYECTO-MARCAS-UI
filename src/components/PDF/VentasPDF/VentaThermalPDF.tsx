import type React from "react";
import {
  Image,
  Text,
  View,
  Page,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");

interface Empresa {
  id?: number;
  nombre: string;
  telefono: string;
  pbx?: string;
  direccion: string;
  email: string;
  website?: string;
}

const formatearFecha = (fecha: string) => {
  const nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm:ss A");
  return nueva_fecha;
};

export interface VentaTypePDF {
  id: number;
  timestamp: string;
  monto: number;
  montoConDescuento: number;
  descuento: number;
  metodoPago: "CONTADO" | "TARJETA" | "TRANSFERENCIA_BANCO";
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
      codigoProducto: string;
    };
  }[];
}

interface VentaThermalProps {
  venta: VentaTypePDF | undefined;
  empresa: Empresa | undefined;
  logoSrc?: string; // Prop para el logo
}

// NOTA IMPORTANTE: Para la mejor nitidez del logo en impresoras térmicas,
const VentaThermalPDF: React.FC<VentaThermalProps> = ({
  venta,
  empresa,
  logoSrc,
}) => {
  // Ancho de 80mm en puntos (1 pulgada = 72 puntos, 80mm = 3.1496 pulgadas)
  const THERMAL_WIDTH_POINTS = (80 / 25.4) * 72;

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 8, // Reducir tamaño de fuente general
      padding: 10, // Reducir padding para maximizar el área de impresión
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      width: THERMAL_WIDTH_POINTS, // Establecer ancho fijo
    },
    header: {
      flexDirection: "column", // Apilar elementos verticalmente
      alignItems: "center", // Centrar elementos
      marginBottom: 10,
      borderBottom: "1.5 solid #000000", // Borde simple para impresoras térmicas
      paddingBottom: 5,
    },
    logo: {
      width: 60,
      height: 40,
      marginBottom: 5,
    },
    companyInfo: {
      flexDirection: "column",
      alignItems: "center", // Centrar información de la empresa
    },
    companyName: {
      fontSize: 8,
      fontWeight: "bold",
      color: "#000000",
      marginBottom: 2,
    },
    companyDetails: {
      fontSize: 7,
      color: "#000000",
      marginBottom: 1,
      textAlign: "center",
    },
    invoiceTitle: {
      fontSize: 8,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#000000",
      alignSelf: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    customerInfo: {
      flexDirection: "column", // Apilar información del cliente
      marginBottom: 10,
      padding: 5,
      border: "1 solid #E5E7EB", // Borde simple
      borderRadius: 3,
    },
    infoColumn: {
      flexDirection: "column",
      width: "100%",
      marginBottom: 5,
    },
    label: {
      fontSize: 8,
      fontWeight: "bold",
      marginBottom: 2,
      color: "#000000",
    },
    value: {
      fontSize: 8,
      marginBottom: 2,
      color: "#000000",
    },
    invoiceNumber: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#000000",
      textAlign: "center",
      marginBottom: 2,
    },
    invoiceDate: {
      fontSize: 8,
      color: "#000000",
      textAlign: "center",
      marginBottom: 2,
    },
    paymentMethod: {
      fontSize: 8,
      color: "#000000",
      padding: 2,
      backgroundColor: "#F3F4F6", // Fondo claro
      borderRadius: 2,
      alignSelf: "center", // Centrar método de pago
      marginTop: 3,
    },
    table: {
      flexDirection: "column",
      marginBottom: 10,
      borderWidth: 1.5,
      // borderWidth: 0,
      borderColor: "#000000",
      borderRadius: 3,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1.5,
      borderBottomColor: "#000000",
      alignItems: "center",
      height: 20, // Altura de fila más pequeña
      backgroundColor: "#E5E7EB", // Fondo claro para encabezado
    },
    tableHeaderCell: {
      color: "#000000",
      fontWeight: "bold",
      padding: 4,
      fontSize: 7,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#000000",
      alignItems: "center",
      minHeight: 18,
    },
    tableRowEven: {
      backgroundColor: "#F9FAFB",
    },
    tableCell: {
      padding: 4,
      color: "#000000",
      fontSize: 7,
    },
    description: {
      width: "45%",
    },
    price: {
      width: "20%",
      textAlign: "right",
    },
    quantity: {
      width: "15%",
      textAlign: "center",
    },
    amount: {
      width: "20%",
      textAlign: "right",
    },
    footer: {
      flexDirection: "column",
      marginTop: 10,
      // borderTop: "1.5 solid #000000",
      paddingTop: 5,
      // borderTop: "0 solid #000000", // Cambia de "1.5 solid #000000" a "0 solid #000000" o "none"
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 3,
    },
    footerLabel: {
      fontSize: 8,
      fontWeight: "bold",
      width: "40%", // Ajustar ancho para etiquetas de pie de página
      textAlign: "right",
      marginRight: 5,
      color: "#000000",
    },
    footerValue: {
      fontSize: 8,
      width: "40%",
      textAlign: "right",
      color: "#000000",
    },
    discountRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 5,
    },
    discountLabel: {
      fontSize: 7,
      width: "40%",
      textAlign: "right",
      marginRight: 5,
      color: "#6B7280",
      fontStyle: "italic",
    },
    discountValue: {
      fontSize: 7,
      width: "40%",
      textAlign: "right",
      color: "#6B7280",
      fontStyle: "italic",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 5,
      paddingTop: 5,
      borderTop: "1 solid #000000",
    },
    totalLabel: {
      fontSize: 11,
      fontWeight: "bold",
      width: "40%",
      textAlign: "right",
      marginRight: 5,
      color: "#000000",
    },
    totalValue: {
      fontSize: 11,
      fontWeight: "bold",
      width: "40%",
      textAlign: "right",
      color: "#000000",
    },
    thankYou: {
      marginTop: 15,
      fontSize: 9,
      color: "#000000",
      textAlign: "center",
      fontStyle: "italic",
    }, //NUEVOS
    colDesc: { width: "42%" }, // nombre
    colCode: { width: "18%", textAlign: "center" },
    colQty: { width: "10%", textAlign: "center" },
    colPrice: { width: "15%", textAlign: "right" },
    colTotal: { width: "15%", textAlign: "right" },
  });

  if (!venta || !empresa) {
    return (
      <Document>
        <Page size={[THERMAL_WIDTH_POINTS, "auto"]} style={styles.page}>
          <Text>No hay datos de la venta o de la empresa disponibles.</Text>
        </Page>
      </Document>
    );
  }

  const Header = () => (
    <View style={styles.header}>
      {logoSrc && (
        <Image style={styles.logo} src={logoSrc || "/placeholder.svg"} />
      )}
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{empresa.nombre}</Text>
        <Text style={styles.companyDetails}>{empresa.direccion}</Text>
        <Text style={styles.companyDetails}>
          Tel: {empresa.telefono} {empresa.pbx && `| PBX: ${empresa.pbx}`}
        </Text>
        <Text style={styles.companyDetails}>{empresa.email}</Text>
        {empresa.website && (
          <Text style={styles.companyDetails}>{empresa.website}</Text>
        )}
      </View>
    </View>
  );

  const CustomerInfo = () => (
    <View style={styles.customerInfo}>
      <View style={styles.infoColumn}>
        <Text style={styles.label}>
          Cliente:{" "}
          {venta.cliente.apellido
            ? venta.cliente.nombre + " " + venta.cliente.apellido
            : venta.cliente.nombre}
        </Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={styles.invoiceDate}>
          Fecha: {formatearFecha(venta.timestamp)}
        </Text>
        <Text style={styles.paymentMethod}>Pago: {venta.metodoPago}</Text>
      </View>
    </View>
  );

  const ProductTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.description]}>
          Producto
        </Text>

        <Text style={[styles.tableHeaderCell, styles.colCode]}>Código</Text>

        <Text style={[styles.tableHeaderCell, styles.quantity]}>Cant.</Text>
        <Text style={[styles.tableHeaderCell, styles.price]}>Precio</Text>
        <Text style={[styles.tableHeaderCell, styles.amount]}>Subtotal</Text>
      </View>
      {venta.productos.map((producto, index) => (
        <View
          style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
          key={index}
        >
          <Text style={[styles.tableCell, styles.description]}>
            {producto.producto.nombre}
          </Text>

          <Text style={[styles.tableCell, styles.colCode]}>
            {producto.producto.codigoProducto}
          </Text>

          <Text style={[styles.tableCell, styles.quantity]}>
            {producto.cantidad}
          </Text>
          <Text style={[styles.tableCell, styles.price]}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(producto.precio)}
          </Text>

          <Text style={[styles.tableCell, styles.amount]}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(producto.precio * producto.cantidad)}
          </Text>
        </View>
      ))}
    </View>
  );

  const Footer = () => {
    const total =
      venta.montoConDescuento ||
      venta.productos.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0
      ) *
        (1 - (venta.descuento || 0) / 100);
    const descuento = venta.descuento || 0;
    return (
      <View style={styles.footer}>
        {descuento > 0 && (
          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>Descuento aplicado:</Text>
            <Text style={styles.discountValue}>{descuento}%</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(total)}
          </Text>
        </View>
        <Text style={styles.thankYou}>¡Gracias por su compra!</Text>
      </View>
    );
  };

  return (
    <Document>
      <Page size={[THERMAL_WIDTH_POINTS, "auto"]} style={styles.page}>
        <Header />
        <Text style={styles.invoiceTitle}>Factura de Venta #{venta.id}</Text>
        <CustomerInfo />
        <ProductTable />
        <Footer />
      </Page>
    </Document>
  );
};

export default VentaThermalPDF;

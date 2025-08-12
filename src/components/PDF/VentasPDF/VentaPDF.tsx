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

// Asegúrate de que la ruta del logo sea correcta en tu proyecto
// Para este ejemplo, usaremos un placeholder si no se proporciona.
// import logo from "../../../assets/images/logoEmpresa.png";

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

interface VentaProps {
  venta: VentaTypePDF | undefined;
  empresa: Empresa | undefined;
  logoSrc?: string; // Añadir prop para el logo
}

const VentaPDF: React.FC<VentaProps> = ({ venta, empresa, logoSrc }) => {
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 30,
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      borderBottom: "2 solid #4F46E5",
      paddingBottom: 15,
    },
    logo: {
      width: 80,
      height: 53,
    },
    companyInfo: {
      flexDirection: "column",
      alignItems: "flex-end",
    },
    companyName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#4F46E5",
      marginBottom: 5,
    },
    companyDetails: {
      fontSize: 9,
      color: "#4B5563",
      marginBottom: 2,
    },
    invoiceTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#4F46E5",
      alignSelf: "center",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    customerInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      backgroundColor: "#F3F4F6",
      padding: 15,
      borderRadius: 5,
      borderLeft: "4 solid #4F46E5",
    },
    infoColumn: {
      flexDirection: "column",
      width: "48%",
    },
    label: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 4,
      color: "#4F46E5",
    },
    value: {
      fontSize: 10,
      marginBottom: 6,
      color: "#1F2937",
    },
    table: {
      flexDirection: "column",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 5,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#4F46E5",
      alignItems: "center",
      height: 32,
      backgroundColor: "#4F46E5",
    },
    tableHeaderCell: {
      color: "#FFFFFF",
      fontWeight: "bold",
      padding: 8,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      alignItems: "center",
      minHeight: 30,
    },
    tableRowEven: {
      backgroundColor: "#F9FAFB",
    },
    tableCell: {
      padding: 8,
      color: "#4B5563",
    },
    description: {
      width: "40%",
    },
    price: {
      width: "20%",
      textAlign: "right",
    },
    quantity: {
      width: "20%",
      textAlign: "center",
    },
    amount: {
      width: "20%",
      textAlign: "right",
    },
    footer: {
      flexDirection: "column",
      marginTop: 20,
      borderTop: "2 solid #E5E7EB",
      paddingTop: 15,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 5,
    },
    footerLabel: {
      fontSize: 10,
      fontWeight: "bold",
      width: "20%",
      textAlign: "right",
      marginRight: 10,
      color: "#4B5563",
    },
    footerValue: {
      fontSize: 10,
      width: "20%",
      textAlign: "right",
      color: "#4B5563",
    },
    discountRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 10,
    },
    discountLabel: {
      fontSize: 8,
      width: "20%",
      textAlign: "right",
      marginRight: 10,
      color: "#6B7280",
      fontStyle: "italic",
    },
    discountValue: {
      fontSize: 8,
      width: "20%",
      textAlign: "right",
      color: "#6B7280",
      fontStyle: "italic",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 5,
      paddingTop: 8,
      borderTop: "1 solid #E5E7EB",
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: "bold",
      width: "20%",
      textAlign: "right",
      marginRight: 10,
      color: "#4F46E5",
    },
    totalValue: {
      fontSize: 14,
      fontWeight: "bold",
      width: "20%",
      textAlign: "right",
      color: "#4F46E5",
    },
    thankYou: {
      marginTop: 30,
      fontSize: 11,
      color: "#6B7280",
      textAlign: "center",
      fontStyle: "italic",
    },
    invoiceNumber: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#4F46E5",
    },
    invoiceDate: {
      fontSize: 10,
      color: "#4B5563",
    },
    paymentMethod: {
      fontSize: 10,
      color: "#4B5563",
      padding: 4,
      backgroundColor: "#EEF2FF",
      borderRadius: 3,
      alignSelf: "flex-start",
      marginTop: 5,
    }, //NUEVOS
    colDesc: { width: "43%" }, // nombres suelen ser largos
    colCode: { width: "12%", textAlign: "center" },
    colPrice: { width: "15%", textAlign: "right" },
    colQty: { width: "15%", textAlign: "center" },
    colTotal: { width: "15%", textAlign: "right" },
  });

  if (!venta || !empresa) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No hay datos de la venta o de la empresa disponibles.</Text>
        </Page>
      </Document>
    );
  }

  const Header = () => (
    <View style={styles.header}>
      {/* Usa logoSrc si está disponible, de lo contrario, un placeholder */}
      <Image style={styles.logo} src={logoSrc || "/placeholder.svg"} />
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
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>
          {venta.cliente.apellido
            ? venta.cliente.nombre + " " + venta.cliente.apellido
            : venta.cliente.nombre}
        </Text>
        <Text style={styles.value}>Tel: {venta.cliente.telefono}</Text>
        <Text style={styles.value}>Dirección: {venta.cliente.direccion}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={styles.invoiceNumber}>Factura #0{venta.id}</Text>
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
        <Text style={[styles.tableHeaderCell, styles.price]}>Precio</Text>

        <Text style={[styles.tableHeaderCell, styles.quantity]}>Cantidad</Text>
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

          <Text style={[styles.tableCell, styles.price]}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(producto.precio)}
          </Text>
          <Text style={[styles.tableCell, styles.quantity]}>
            {producto.cantidad}
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
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.invoiceTitle}>Factura de Venta</Text>
        <CustomerInfo />
        <ProductTable />
        <Footer />
      </Page>
    </Document>
  );
};

export default VentaPDF;

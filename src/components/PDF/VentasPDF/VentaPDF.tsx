import React from "react";
import {
  Image,
  Text,
  View,
  Page,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import logo from "../../../assets/images/logoEmpresa.png";
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
  let nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm:ss A");
  return nueva_fecha;
};

interface VentaProps {
  venta: VentaTypePDF | undefined;
  empresa: Empresa | undefined;
}

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
    };
  }[];
}

const VentaPDF: React.FC<VentaProps> = ({ venta, empresa }) => {
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 30,
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      borderBottom: "2 solid #3f51b5",
      paddingBottom: 10,
    },
    logo: {
      width: 120,
      height: 80,
    },
    companyInfo: {
      flexDirection: "column",
      alignItems: "flex-end",
    },
    companyName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#3f51b5",
      marginBottom: 5,
    },
    companyDetails: {
      fontSize: 9,
      color: "#555",
      marginBottom: 2,
    },
    invoiceTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 0,
      marginBottom: 5,
      color: "#3f51b5",
      alignSelf: "center",
    },
    customerInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 0,
      backgroundColor: "#f5f5f5",
      padding: 10,
      borderRadius: 0,
    },
    infoColumn: {
      flexDirection: "column",
      width: "48%",
    },
    label: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 3,
      color: "#3f51b5",
    },
    value: {
      fontSize: 10,
      marginBottom: 5,
    },
    table: {
      flexDirection: "column",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#e0e0e0",
      borderRadius: 0,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#3f51b5",
      alignItems: "center",
      height: 30,
      backgroundColor: "#3f51b5",
    },
    tableHeaderCell: {
      color: "#FFFFFF",
      fontWeight: "bold",
      padding: 5,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      alignItems: "center",
      height: 25,
    },
    tableRowEven: {
      backgroundColor: "#f9f9f9",
    },
    tableCell: {
      padding: 5,
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
      borderTop: "2 solid #3f51b5",
      paddingTop: 10,
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
      color: "#3f51b5",
    },
    footerValue: {
      fontSize: 10,
      width: "20%",
      textAlign: "right",
    },
    total: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#3f51b5",
    },
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
      <Image style={{ width: 80, height: 53 }} src={logo} />
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{empresa.nombre}</Text>
        <Text style={styles.companyDetails}>{empresa.direccion}</Text>
        <Text style={styles.companyDetails}>
          Tel: {empresa.telefono} | PBX: {empresa.pbx}
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
        <Text style={styles.value}>{venta.cliente.direccion}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={styles.label}>Factura No.:</Text>
        <Text style={styles.value}>#0{venta.id}</Text>
        <Text style={styles.label}>Fecha de Emisión:</Text>
        <Text style={styles.value}>{formatearFecha(venta.timestamp)}</Text>
        <Text style={styles.label}>Método de Pago:</Text>
        <Text style={styles.value}>{venta.metodoPago}</Text>
      </View>
    </View>
  );

  const ProductTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.description]}>
          Producto
        </Text>
        <Text style={[styles.tableHeaderCell, styles.price]}>Precio</Text>
        <Text style={[styles.tableHeaderCell, styles.quantity]}>Cantidad</Text>
        <Text style={[styles.tableHeaderCell, styles.amount]}>Total</Text>
      </View>
      {venta.productos.map((producto, index) => (
        <View
          style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
          key={index}
        >
          <Text style={[styles.tableCell, styles.description]}>
            {producto.producto.nombre}
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
    const subtotal = venta.productos.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
    const descuento = venta.descuento || 0;
    const total =
      venta.montoConDescuento || subtotal - (subtotal * descuento) / 100;

    return (
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Subtotal:</Text>
          <Text style={styles.footerValue}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(subtotal)}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Descuento:</Text>
          <Text style={styles.footerValue}>{descuento}%</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, styles.total]}>Total:</Text>
          <Text style={[styles.footerValue, styles.total]}>
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(total)}
          </Text>
        </View>
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

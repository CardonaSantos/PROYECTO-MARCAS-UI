import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
// import { useTheme } from "next-themes";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Percent,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Text,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { CategoriaFiltrar } from "../Utils/Types/CategoyFilter";
import { jwtDecode } from "jwt-decode";

import { useSocket } from "@/Context/SocketProvider ";
import { motion } from "framer-motion";
// import { Cliente, Descuento } from "../Utils/Types/CustomersWithDiscount";
const API_URL = import.meta.env.VITE_API_URL;
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link } from "react-router-dom";
import SelectComponent from "react-select";
import { useStore } from "@/Context/ContextSucursal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import placeholder from "@/assets/images/placeholder.jpg";
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string | undefined) => {
  let nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm:ss A");
  return nueva_fecha;
};
interface Imagen {
  id: number;
  url: string;
  productoId: number;
  creadoEn: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  creadoEn: string;
  actualizadoEn: string;
  codigoProducto: string;
  stock: Stock | null;
  categorias: Category[];
  imagenes: Imagen[]; // Nueva propiedad
}

interface Stock {
  id: number;
  productoId: number;
  cantidad: number;
  proveedorId: number;
  costo: number;
  creadoEn: string;
  actualizadoEn: string;
}

interface Category {
  categoria: Categoria1;
  creadoEn: string;
}

interface Categoria1 {
  actualizadoEn: string;
  id: number;
  nombre: string;
}

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: string;
  descuentos: Descuento[];
}

interface Descuento {
  id: number;
  porcentaje: number;
  clienteId: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}
interface UserTokenInfo {
  nombre: string;
  correo: string;
  rol: string;
  sub: number;
}

interface Cliente2 {
  actualizadoEn: string;
  correo: string;
  creadoEn: string;
  descuentos: Descuento[];
  direccion: string;
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
}

interface Visita2 {
  actualizadoEn: string;
  cliente: Cliente2;
  clienteId: number;
  creadoEn: string;
  estadoVisita: string;
  fin: string | null;
  id: number;
  inicio: string;
  motivoVisita: string;
  observaciones: string | null;
  tipoVisita: string;
  usuarioId: number;
  ventaId: number | null;
}

export default function MakeSale() {
  const empresaId = useStore((state) => state.sucursalId) ?? 0;
  const [tokenUser, setTokenUser] = useState<UserTokenInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode<UserTokenInfo>(token);
        setTokenUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);
  console.log("El token user es: ", tokenUser);

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedMetodPago, setSelectedMetodPago] = useState("CONTADO");

  // const [products, setProducts] = useState<Producto[]>([]);

  const [cart, setCart] = useState<(Producto & { quantity: number })[]>([]); // Agregamos `quantity` al estado del carrito
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(
    null
  );
  const [selectedDiscount, setSelectedDiscount] = useState<Descuento | null>(
    null
  );
  const [descuento, setDescuento] = useState<number>();
  const [nota, setNota] = useState<string>("");
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [categoria, setCategoria] = useState<CategoriaFiltrar[]>([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const socket = useSocket();

  // 📌 Estados para productos y paginación
  const [products, setProducts] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async (newPage: number) => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `${API_URL}/product?page=${newPage}&limit=${itemsPerPage}`
        );

        console.log(
          "Productos recibidos:",
          response.data.products.length,
          response.data.products
        );

        if (response.status === 200 && Array.isArray(response.data.products)) {
          setProducts((prev) => {
            // 🔥 Filtrar duplicados antes de actualizar el estado
            const mergedProducts = [...prev, ...response.data.products];
            const uniqueProducts = mergedProducts.filter(
              (product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
            );

            return uniqueProducts;
          });

          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProducts(page);
  }, [page]);

  // 🔍 Detectar scroll y cargar más productos
  useEffect(() => {
    // const observer = new IntersectionObserver(
    //   (entries) => {
    //     if (entries[0].isIntersecting && page < totalPages && !isFetching) {
    //       setPage((prev) => prev + 1);
    //     }
    //   },
    //   { threshold: 1.0 }
    // );

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.2 } // Cambiar de 1.0 a 0.2
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isFetching, page, totalPages]);

  ///===============================
  const getCustomers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/customers/all-customers-with-discount`
      );
      if (response.status === 200) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("No se encontraron clientes");
    }
  };

  // Obtener clientes
  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/customers/all-customers-with-discount`
        );
        if (response.status === 200) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("No se encontraron clientes");
      }
    };

    getCustomers();
  }, []);

  // Obtener categorias
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (response.status === 200) {
          setCategoria(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("No se encontraron clientes");
      }
    };

    getCategories();
  }, []);

  // Funciones de carrito
  const addToCart = (product: Producto) => {
    if (!product.stock || product.stock?.cantidad <= 0) {
      //si es null o no tiene suficiente
      toast.info("Stock insuficiente");
      return;
    }

    const productoExistente = cart.some((prod) => prod.id === product.id);

    if (productoExistente) {
      toast.info("El objeto ya está en el carrito");
      return;
    }

    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
    toast.success("Añadido al Carrito");
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success("Eliminado del Carrito");
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return; // Evitar cantidades negativas
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calcular total con descuento
  const calculateTotalConDescuento = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.precio * item.quantity,
      0
    );
    const discountPercentage = selectedDiscount
      ? selectedDiscount.porcentaje / 100
      : 0;
    return Number((subtotal * (1 - discountPercentage)).toFixed(2));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.precio * item.quantity,
      0
    );

    return subtotal;
  };

  // Filtrar productos
  const filteredProducts = products.filter(
    (product) =>
      (searchTerm === "" ||
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigoProducto
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "Todas" ||
        product.categorias.some(
          (cat) => cat.categoria.nombre === selectedCategory
        ))
  );

  console.log(cart);

  type SaleData = {
    // Campos para ventas normales (obligatorios)
    monto: number;
    montoConDescuento: number;
    metodoPago: string;
    empresaId: number;
    descuento?: number;
    clienteId?: number;
    vendedorId?: number;
    productos: {
      productoId: number;
      cantidad: number;
      precio: number;
    }[];

    // Campos opcionales (solo necesarios si es CREDITO)
    creditoInicial?: number;
    numeroCuotas?: number;
    interes?: number;
    comentario?: string;
    diasEntrePagos?: number;
  };

  const formatoCartData = (
    cart: (Producto & { quantity: number })[]
  ): SaleData => {
    // Construimos los campos base
    const baseData: SaleData = {
      monto: cart.reduce(
        (total, item) => total + item.precio * item.quantity,
        0
      ),
      montoConDescuento: calculateTotalConDescuento(),
      metodoPago: selectedMetodPago,
      empresaId: empresaId,
      descuento: selectedDiscount?.porcentaje,
      clienteId: selectedCustomer?.id,
      vendedorId: tokenUser?.sub,
      productos: cart.map((item) => ({
        productoId: item.id,
        cantidad: item.quantity,
        precio: item.precio,
      })),
    };

    // Si es crédito, añadimos los campos de crédito
    if (selectedMetodPago === "CREDITO") {
      baseData.creditoInicial = creditoInfo.creditoInicial || 0;
      baseData.numeroCuotas = creditoInfo.numeroCuotas || 0;
      baseData.interes = creditoInfo.interes || 0;
      baseData.comentario = creditoInfo.comentario || undefined;
      baseData.diasEntrePagos = creditoInfo.diasEntrePagos || undefined;
    }

    return baseData;
  };

  const clearCart = () => {
    setCart([]); // Asume que estás usando `setCart` para actualizar el carrito
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  type Venta = {
    id: number;
    monto: number;
    montoConDescuento: number;
    descuento: number;
    metodoPago: "CONTADO" | "CREDITO"; // Agrega otros métodos de pago si existen
    timestamp: string; // ISO 8601 timestamp
    usuarioId: number;
    clienteId: number | null; // Puede ser `null`
    visitaId: number | null; // Puede ser `null`
    // productos: ProductoVenta[];
  };

  const [saleMade, setSaleMade] = useState<Venta>();
  const [openDialogSaleMade, setOpenDialogSaleMade] = useState<boolean>(false);

  const formatearMoneda = (cantidad: number | undefined): string => {
    if (cantidad === undefined) {
      return "N/A"; // Puedes devolver un valor predeterminado o manejarlo de otra forma
    }
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(cantidad);
  };

  const sendCartData = async (cart: (Producto & { quantity: number })[]) => {
    const formateado: SaleData = formatoCartData(cart);

    console.log("Data a enviar:", formateado);

    if (
      !formateado.clienteId ||
      typeof formateado.monto === "undefined" ||
      !formateado.productos ||
      !formateado.vendedorId ||
      !formateado.montoConDescuento ||
      !formateado.metodoPago
    ) {
      toast.info("Faltan campos sin llenar");
      return;
    }

    // Validaciones adicionales si es CREDITO
    if (formateado.metodoPago === "CREDITO") {
      if (
        !formateado.numeroCuotas ||
        formateado.numeroCuotas <= 0 ||
        !formateado.interes ||
        !formateado.diasEntrePagos ||
        formateado.diasEntrePagos < 0 ||
        formateado.interes < 0
      ) {
        toast.info("Datos de crédito inválidos. Revisa cuotas e interés.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_URL}/sale`, formateado);
      if (response.status === 200 || response.status === 201) {
        setSaleMade(response.data);
        toast.success("Venta creada");
        clearCart();
        setSelectedCustomer(null);
        setIsSubmitting(false);
        setShowCartModal(false);
        setConfirmSale(false);
        setTimeout(() => {
          setOpenDialogSaleMade(true);
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear venta");
      setIsSubmitting(false);
    }
  };

  //----------------
  const [registroAbierto, setRegistroAbierto] = useState<Visita2 | null>(null);

  useEffect(() => {
    const getRegistOpen = async () => {
      if (tokenUser?.sub) {
        try {
          const response = await axios.get(
            `${API_URL}/date/regist-open/${tokenUser?.sub}`
          );

          if (response.status === 200) {
            const visitaData = response.data;

            // Actualiza el registro abierto
            setRegistroAbierto(visitaData);

            // Usa la data recibida directamente para actualizar el selectedCustomer
            setSelectedCustomer({
              id: visitaData?.cliente?.id ?? 0, // Asegura que no sea undefined
              nombre: visitaData?.cliente?.nombre ?? "", // Proporciona un valor por defecto si es undefined
              correo: visitaData?.cliente?.correo ?? "",
              apellido: visitaData?.cliente?.apellido ?? "",
              telefono: visitaData?.cliente?.telefono ?? "",
              direccion: visitaData?.cliente?.direccion ?? "",
              creadoEn: visitaData?.cliente?.creadoEn ?? "",
              actualizadoEn: visitaData?.cliente?.actualizadoEn ?? "",
              descuentos: visitaData?.cliente?.descuentos ?? [], // Proporciona un arreglo vacío si es undefined
            });
          }
        } catch (error) {
          console.error("Error al obtener registro abierto:", error);
        }
      }
    };

    if (tokenUser && tokenUser.sub) {
      getRegistOpen();
    }
  }, [tokenUser]);

  console.log("El registro abierto es: ", registroAbierto);
  console.log(
    "El id del cliente del registro vsita es: ",
    registroAbierto?.clienteId
  );

  // async function realizarVentaConVisita(
  //   cart: (Producto & { quantity: number })[]
  // ) {
  //   const formateado = formatoCartData(cart);

  //   console.log("La data a enviar es: ", formateado);

  //   // Validar campos requeridos
  //   if (
  //     !formateado.clienteId ||
  //     typeof formateado.monto === "undefined" ||
  //     !formateado.productos ||
  //     !formateado.vendedorId ||
  //     !formateado.montoConDescuento ||
  //     !formateado.metodoPago
  //   ) {
  //     toast.info("Faltan campos sin llenar");
  //     return;
  //   }

  //   // Validaciones adicionales si es CREDITO
  //   if (formateado.metodoPago === "CREDITO") {
  //     if (
  //       !formateado.numeroCuotas ||
  //       formateado.numeroCuotas <= 0 ||
  //       !formateado.interes ||
  //       formateado.interes < 0 ||
  //       !formateado.creditoInicial ||
  //       formateado.creditoInicial < 0
  //     ) {
  //       toast.info(
  //         "Datos de crédito inválidos. Revisa cuotas, interés y crédito inicial."
  //       );
  //       return;
  //     }
  //   }

  //   console.log("Datos a enviar:", {
  //     formateado,
  //     registroVisitaId: registroAbierto?.id,
  //   });

  //   try {
  //     setIsSubmitting(true); // Deshabilitar el botón
  //     const response = await axios.post(`${API_URL}/sale/sale-for-regis`, {
  //       ...formateado,
  //       registroVisitaId: registroAbierto?.id,
  //     });

  //     if (response.status === 200 || response.status === 201) {
  //       setSaleMade(response.data); // Guardar datos de la venta
  //       toast.success("Venta creada");
  //       clearCart();
  //       setIsSubmitting(false); // Habilitar el botón si la venta es exitosa
  //       setShowCartModal(false); // Cerrar el modal

  //       // Mostrar el diálogo después de un breve retraso
  //       setTimeout(() => {
  //         setOpenDialogSaleMade(true);
  //       }, 1500);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Error al crear venta");
  //     setIsSubmitting(false); // Rehabilitar el botón si hay un error
  //   }
  // }

  async function realizarVentaConVisita(
    cart: (Producto & { quantity: number })[]
  ) {
    const formateado = formatoCartData(cart);

    console.log("La data a enviar es: ", formateado);

    if (
      !formateado.clienteId ||
      typeof formateado.monto === "undefined" ||
      !formateado.productos ||
      !formateado.vendedorId ||
      !formateado.montoConDescuento ||
      !formateado.metodoPago
    ) {
      toast.info("Faltan campos sin llenar");
      return;
    }

    // Validaciones adicionales si es CREDITO
    if (formateado.metodoPago === "CREDITO") {
      if (
        !formateado.numeroCuotas ||
        formateado.numeroCuotas <= 0 ||
        !formateado.interes ||
        formateado.interes < 0 ||
        !formateado.diasEntrePagos || // ✅ Agregado para igualar la validación de sendCartData
        formateado.diasEntrePagos < 0 ||
        !formateado.creditoInicial ||
        formateado.creditoInicial < 0
      ) {
        toast.info(
          "Datos de crédito inválidos. Revisa cuotas, interés, días entre pagos y crédito inicial."
        );
        return;
      }
    }

    console.log("Datos a enviar:", {
      ...formateado,
      registroVisitaId: registroAbierto?.id,
    });

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_URL}/sale/sale-for-regis`, {
        ...formateado,
        registroVisitaId: registroAbierto?.id,
        visita: true,
      });

      if (response.status === 200 || response.status === 201) {
        setSaleMade(response.data);
        toast.success("Venta creada");
        clearCart();
        // setSelectedCustomer(null); // ✅ Igual que en sendCartData
        setIsSubmitting(false);
        setShowCartModal(false);
        setConfirmSale(false);
        setTimeout(() => {
          setOpenDialogSaleMade(true);
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear venta");
      setIsSubmitting(false);
    }
  }

  console.log("El usuario seleccionado es: ", selectedCustomer);

  //----------------------------------------------------------------

  const requestCustomDiscount = async () => {
    if (!selectedCustomer?.id || !tokenUser?.sub || !descuento) {
      toast.warning("Faltan datos para la solicitud");
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/discount/request-discount`,
        {
          clienteId: selectedCustomer?.id, // ID del cliente
          justificacion: nota || "", // Justificación o motivo del descuento
          usuarioId: tokenUser?.sub, // ID del usuario/vendedor
          descuentoSolicitado: Number(descuento), // Porcentaje del descuento solicitado
          motivo: nota || "Sin motivo adicional", // Motivo adicional
        }
      );

      if (response.status == 200 || response.status == 201) {
        console.log("Solicitud enviada con éxito");
        toast.success("Solicitud enviada. Esperando respuesta...");
        setNota("");
        setDescuento(0);
      } else {
        console.error("Error al enviar la solicitud:", response.data.error);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      // Verifica si el rol es VENDEDOR
      // Escuchar el evento específico para vendedores
      socket.on("newNotificationToSeller", (newNotification) => {
        console.log(
          "La notificación entrante para vendedor es: ",
          newNotification
        );

        getCustomers();
      });

      // Limpiar el evento al desmontar el componente
      return () => {
        socket.off("newNotificationToSeller"); // Limpiar el evento específico para vendedores
      };
    }
  }, [socket, tokenUser]); // Añadir tokenUser como dependencia para actualizar si cambia

  // Opciones de ejemplo para el selector (customers)
  const options = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.nombre} ${customer.apellido || ""}`,
  }));

  const opcionesDescuento = selectedCustomer?.descuentos.map((desc) => ({
    value: desc.id,
    label: `${desc.porcentaje.toString()}`,
  }));

  // Tipos para el estado de la información del crédito
  type CreditoInfo = {
    creditoInicial: number | null;
    numeroCuotas: number | null;
    interes: number | null;
    comentario: string | null;
    diasEntrePagos: number | null;
  };

  const [creditoInfo, setCreditoInfo] = useState<CreditoInfo>({
    creditoInicial: null,
    interes: null,
    numeroCuotas: null,
    comentario: null,
    diasEntrePagos: null,
  });

  const [montoTotal, setMontoTotal] = useState<number>(
    formatoCartData(cart).montoConDescuento // Suponiendo que formatoCartData retorna el monto con descuento
  );

  // Cálculo directo, sin useMemo
  const { interes, creditoInicial, numeroCuotas } = creditoInfo;
  let saldoRestante = 0;
  let montoInteres = 0;
  let montoTotalConInteres = 0;
  let pagoPorCuota = 0;

  if (montoTotal && numeroCuotas && interes) {
    montoInteres = montoTotal * (interes / 100);
    montoTotalConInteres = montoTotal + montoInteres;
    saldoRestante = montoTotalConInteres - (creditoInicial || 0);
    pagoPorCuota = saldoRestante > 0 ? saldoRestante / numeroCuotas : 0;
  }

  useEffect(() => {
    setMontoTotal(formatoCartData(cart).montoConDescuento);
  }, [cart, selectedDiscount]);

  const fechasDePago = [];
  let hoyFecha = dayjs();

  if (creditoInfo.diasEntrePagos && creditoInfo.numeroCuotas) {
    for (let indice = 0; indice < creditoInfo?.numeroCuotas; indice++) {
      const fechaPago = hoyFecha.add(creditoInfo.diasEntrePagos, "day");
      fechasDePago.push(fechaPago.format("D [de] MMMM [de] YYYY"));
      hoyFecha = fechaPago;
    }
  }

  // interface CreditSummaryProps {
  //   saldoRestante: number;
  //   montoTotal: number;
  //   montoInteres: number;
  //   montoTotalConInteres: number;
  //   pagoPorCuota: number;
  //   fechasDePago: string[];
  // }

  interface SummaryItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
  }

  function SummaryItem({
    icon,
    label,
    value,
  }: SummaryItemProps): React.ReactElement {
    return (
      <div className="flex items-center space-x-2">
        {icon}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-semibold">
            {value.toLocaleString("es-GT", {
              style: "currency",
              currency: "GTQ",
            })}
          </p>
        </div>
      </div>
    );
  }

  // const fechas =
  const [confirmSale, setConfirmSale] = useState(false);

  // const [truncarSelectDescuentoForCredit, setTruncarSelectDescuentoForCredit] =
  //   useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (loadMoreRef.current) {
        const rect = loadMoreRef.current.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (isVisible && page < totalPages && !isFetching) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, isFetching, totalPages]);

  interface ProductImageCarouselProps {
    images: { url: string }[];
    productName: string;
  }

  function ProductImageCarousel({
    images,
    productName,
  }: ProductImageCarouselProps) {
    return (
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {images.length > 0 ? (
              images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-4">
                        <img
                          src={image.url ? image.url : placeholder}
                          alt={`${productName} - Image ${index + 1}`}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-4">
                      <img
                        src={placeholder}
                        alt="Imagen no disponible"
                        className="object-cover w-full h-full rounded-md"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
        </Carousel>
      </div>
    );
  }

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [product, setProduct] = useState<Producto>();
  const handleQuickView = (product: Producto) => {
    setIsQuickViewOpen(true);
    setProduct(product);
  };
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Selección de Cliente y Descuento */}
      {/* <div className="lg:col-span-2"> */}
      <div className="w-full p-4 ">
        <Card className="mb-8 shadow-xl">
          <CardContent>
            <h3 className="text-md font-semibold mb-4 pt-2">
              Selección de Cliente
            </h3>
            <div>
              <SelectComponent
                options={options}
                isClearable={true}
                isDisabled={!!registroAbierto} // Deshabilitar si hay registro abierto
                value={
                  registroAbierto
                    ? {
                        value: registroAbierto.cliente.id,
                        label: `${registroAbierto.cliente.nombre} ${
                          registroAbierto.cliente.apellido || ""
                        }`,
                      }
                    : selectedCustomer
                    ? {
                        value: selectedCustomer.id,
                        label: `${selectedCustomer.nombre} ${
                          selectedCustomer.apellido || ""
                        }`,
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (!registroAbierto) {
                    if (selectedOption === null) {
                      // Si se limpia el selector
                      setSelectedCustomer(null);
                    } else {
                      // Si se selecciona una opción
                      const selectedCustomer =
                        customers.find(
                          (customer) => customer.id === selectedOption.value
                        ) || null;
                      setSelectedCustomer(selectedCustomer);
                    }
                  }
                }}
                placeholder="Seleccionar cliente..."
                noOptionsMessage={() => "No se encontró el cliente."}
                isSearchable
                className="text-black"
              />
            </div>

            {selectedCustomer && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Descuentos disponibles:</h3>

                <div>
                  <SelectComponent
                    options={opcionesDescuento || []} // Pasar las opciones de descuento
                    isClearable={true} // Permitir limpiar la selección
                    value={
                      selectedDiscount
                        ? {
                            value: selectedDiscount.id,
                            label: `${selectedDiscount.porcentaje}%`,
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption === null) {
                        // Si se limpia el selector
                        setSelectedDiscount(null);
                      } else {
                        // Si se selecciona una opción
                        const discount = selectedCustomer?.descuentos.find(
                          (desc) => desc.id === selectedOption.value
                        );
                        setSelectedDiscount(discount || null);
                      }
                    }}
                    placeholder="Seleccionar descuento"
                    noOptionsMessage={() => "No hay descuentos disponibles"}
                    isSearchable
                    className="text-black"
                    isDisabled={selectedMetodPago === "CREDITO"}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solicitar Descuento Personalizado */}
        {/* <Card className="mb-1 shadow-xl">
          <CardContent>
            <h3 className="text-md font-semibold mb-4 pt-2">
              Solicitar Descuento
            </h3>
            <div className="flex items-center mb-4">
              <input
                className="bg-white dark:text-black border rounded-md p-2 w-32 mr-2"
                type="number"
                placeholder="Porcentaje"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
              />
              <span className="text-lg">%</span>
            </div>
            <Textarea
              placeholder="Justificación"
              onChange={(e) => setNota(e.target.value)}
              className="mb-4"
              value={nota}
            />
            <Button
              type="button"
              // disabled={isRequesting}
              onClick={requestCustomDiscount}
              className="mt-2"
            >
              Solicitar Descuento Personalizado
            </Button>
          </CardContent>
        </Card> */}
        <Card className="mb-4 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Percent className="w-5 h-5" />
              Solicitar Descuento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="Porcentaje"
                  min="0"
                  max="100"
                  value={descuento || ""}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  className="pl-8 pr-4 py-2 w-full"
                />
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                  %
                </span>
              </div>
            </div>
            <div className="relative">
              <Textarea
                placeholder="Justificación del descuento"
                onChange={(e) => setNota(e.target.value)}
                value={nota}
                className="pl-10 resize-none"
                rows={4}
              />
              <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              // disabled={isRequesting}
              onClick={requestCustomDiscount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Solicitar Descuento Personalizado
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Método de Pago y Carrito */}
      <div className="w-full p-4">
        <Card className="mb-1 shadow-xl bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Método de Pago
            </h3>

            <Select
              value={selectedMetodPago}
              onValueChange={setSelectedMetodPago}
            >
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Seleccione método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTADO">CONTADO</SelectItem>
                <SelectItem value="TARJETA">TARJETA</SelectItem>
                <SelectItem value="TRANSFERENCIA_BANCO">
                  TRANSFERENCIA BANCARIA
                </SelectItem>
                <SelectItem disabled={!!selectedDiscount} value="CREDITO">
                  CRÉDITO
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              // variant="destructive"
              onClick={() => setShowCartModal(true)}
              className="bg-red-500 w-full  text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver Carrito ({cart.length})
            </Button>

            <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
              <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] h-[90vh] max-h-[800px] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="flex items-center justify-between text-xl">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Carrito de Compras
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Productos añadidos al carrito.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow mt-4 pr-4">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      El carrito está vacío
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 sm:mb-0">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {item.nombre}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Q{item.precio.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-10">
                          <Input
                            type="number"
                            min="1"
                            max={item.stock?.cantidad}
                            value={item.quantity}
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number.parseInt(e.target.value)
                                : 1;
                              updateQuantity(item.id, value);
                            }}
                            className="w-16 text-center"
                            aria-label={`Cantidad de ${item.nombre}`}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Eliminar ${item.nombre} del carrito`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>

                <div className="flex-shrink-0 mt-4 space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm">
                    <p className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <CreditCard className="w-4 h-4" />
                      Total: Q{calculateTotal().toFixed(2)}
                    </p>
                    <p className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Percent className="w-4 h-4" />
                      Total con descuento: Q
                      {calculateTotalConDescuento().toFixed(2)}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Descuento:{" "}
                      {selectedDiscount
                        ? `${selectedDiscount.porcentaje}%`
                        : "No seleccionado"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente:{" "}
                      {registroAbierto
                        ? registroAbierto.cliente.nombre
                        : selectedCustomer?.nombre}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Método de pago: {selectedMetodPago}
                    </p>
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="default"
                      onClick={() => setConfirmSale(true)}
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full lg:w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                    >
                      Hacer venta
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowCartModal(false)}
                      className="w-full sm:w-auto lg:w-full"
                    >
                      Cerrar
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* DONDE METER INFO DEL CREDITO */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {selectedMetodPago === "CREDITO" && (
          <div className="col-span-full">
            <div className="w-full mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              {/* ontenido */}

              <div className=" w-full mt-8 animate-in fade-in duration-500">
                <h4 className="text-lg font-semibold mb-4 text-center text-primary">
                  Información del Crédito
                </h4>
                <div className="space-y-6">
                  {/* Número de Cuotas */}
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Número de Cuotas
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ej: 12 cuotas"
                        value={creditoInfo.numeroCuotas || ""}
                        onChange={(e) =>
                          setCreditoInfo((prev) => ({
                            ...prev,
                            numeroCuotas: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Días entre pagos
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ej: 15 (quincenal) 30 (mensual)"
                        value={creditoInfo.diasEntrePagos || ""}
                        onChange={(e) =>
                          setCreditoInfo((prev) => ({
                            ...prev,
                            diasEntrePagos: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Interés */}
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Interés (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 10%"
                        value={creditoInfo.interes || ""}
                        onChange={(e) =>
                          setCreditoInfo((prev) => ({
                            ...prev,
                            interes: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* MEJORAR LA VISTA DE NOTIFICACIONES ENTRANTES EN MOVIL, VERIFICAR EL PDF, AÑADIR EL ARRAY DE IMAGENES A LOS PRODUCTOS */}

                  {/* Pago Inicial */}
                  <div className="flex items-center gap-4">
                    <Coins className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Pago Inicial
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 1000"
                        value={creditoInfo.creditoInicial || ""}
                        onChange={(e) =>
                          setCreditoInfo((prev) => ({
                            ...prev,
                            creditoInicial: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* COMENTARIO SOBRE EL CREDITO */}
                  <div className="flex items-center gap-4">
                    <Text className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Comentario
                      </label>
                      <Textarea
                        placeholder="Opcional"
                        value={creditoInfo.comentario || ""}
                        onChange={(e) =>
                          setCreditoInfo((prev) => ({
                            ...prev,
                            comentario: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen del Crédito */}
              <Card className="mt-5 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-center text-primary">
                    <CreditCard className="inline-block mr-2 h-6 w-6" />
                    Resumen del Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    <SummaryItem
                      icon={<CreditCard className="h-5 w-5 text-primary" />}
                      label="Saldo Restante a Pagar"
                      value={saldoRestante}
                    />
                    <SummaryItem
                      icon={<CreditCard className="h-5 w-5 text-green-500" />}
                      label="Monto sin interés"
                      value={montoTotal}
                    />
                    <SummaryItem
                      icon={<CreditCard className="h-5 w-5 text-yellow-500" />}
                      label="Monto de Interés"
                      value={montoInteres}
                    />
                    <SummaryItem
                      icon={<CreditCard className="h-5 w-5 text-red-500" />}
                      label="Monto Total con Interés"
                      value={montoTotalConInteres}
                    />
                    <SummaryItem
                      icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                      label="Pago por Cada Cuota"
                      value={pagoPorCuota}
                    />
                  </div>

                  <div className="mt-6">
                    <h5 className="text-md font-semibold mb-2 flex items-center">
                      <Calendar className="inline-block mr-2 h-5 w-5" />
                      Fechas de Pago
                    </h5>
                    {fechasDePago.length <= 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <AlertCircle className="inline-block mr-2 h-4 w-4" />
                        Ingrese el número de cuotas y los días entre pagos.
                      </p>
                    ) : (
                      <ScrollArea className="h-[200px] rounded-md border p-4">
                        <ul className="space-y-2">
                          {fechasDePago.map((fecha, index) => (
                            <li key={index} className="flex items-center">
                              <span className="font-bold mr-2">
                                {index + 1}:
                              </span>
                              <span>{fecha}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Productos Filtrados */}
      {/* <div className="lg:col-span-3"> */}
      <div className="w-full p-4">
        <Card className="mb-4 shadow-xl">
          <CardContent>
            <div className="pt-5 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Buscar productos por nombre o código"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las categorías</SelectItem>
                  {categoria?.map((category) => (
                    <SelectItem key={category.nombre} value={category.nombre}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[calc(100vh-100px)] shadow-xl rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {/* SKELETON XD */}
            {isFetching &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="animate-pulse">
                  <Card className="h-full flex flex-col p-4">
                    <div className="w-full aspect-w-1 aspect-h-1 bg-gray-300 rounded-md"></div>
                    <div className="h-6 bg-gray-300 rounded mt-4 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded mt-2 w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded mt-4 w-full"></div>
                  </Card>
                </div>
              ))}

            {filteredProducts.map((product) => (
              <motion.div
                key={`product-${product.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="h-full flex flex-col hover:shadow-lg transition-all duration-300"
                  // onMouseEnter={() => setIsHovered(true)}
                  // onMouseLeave={() => setIsHovered(false)}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                >
                  <CardContent className="flex-grow p-4 relative">
                    <div className="aspect-w-1 aspect-h-1 w-full mb-4 relative">
                      <ProductImageCarousel
                        images={product.imagenes}
                        productName={product.nombre}
                      />
                      {hoveredProduct === product.id && (
                        <Button
                          variant="secondary"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.codigoProducto}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {product.categorias.map((cat, index) => (
                        <Badge
                          key={`category-${product.id}-${index}`}
                          variant="secondary"
                        >
                          {cat.categoria.nombre}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-lg">
                        Q{product.precio.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          product.stock && product.stock.cantidad > 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        {product.stock && product.stock.cantidad > 0
                          ? "En stock"
                          : "Agotado"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.stock || product.stock.cantidad === 0}
                      className="w-full"
                    >
                      {cart.some((prod) => prod.id === product.id) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          En el carrito
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir al Carrito
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
            {product && (
              <DialogContent className="max-w-[90%] max-h-[95%] sm:max-w-[80%] md:max-w-[600px] lg:max-w-[800px] mx-auto overflow-auto grid place-items-center">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {product.nombre}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Código: {product.codigoProducto}
                  </DialogDescription>
                </DialogHeader>
                {/* <div className="grid gap-4 py-4 md:grid-cols-2"> */}

                {/* MEJORAR LA VISTA DE PRODUCTOS EN STOCK, MEJORAR LA PAGINA DONDE
                MOSTRAMOS LOS PRODUCTOS A AÑADIR STOCK, LA EDIION DE PRODUCTOS,
                ELIMINACION, Y AÑADIDO DE IMAGENES, SI ES POSIBLE MEJORAR LA
                ADICION DE IMAGEN AL CROP PORQUE SIENTO QUE ESTÁ PEQUEÑA XD
                SOLAMENTE, CREO, ACTUALIZAR EL SERVIDOR, LAS CREDENCIALES DE
                CLOUDINARY, LAS CREDENCIALES DE GOOGLE MAPS, ETC. */}

                <div className="grid gap-4 py-1 md:py-0 md:grid-cols-2">
                  <div className="order-2 md:order-1 relative">
                    <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        {product.imagenes.length > 0 ? (
                          product.imagenes.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="p-1">
                                <img
                                  src={
                                    image.url.length > 0
                                      ? image.url
                                      : placeholder
                                  }
                                  alt={`${product.nombre} - Imagen ${
                                    index + 1
                                  }`}
                                  className="w-full h-64 object-cover rounded-md"
                                />
                              </div>
                            </CarouselItem>
                          ))
                        ) : (
                          <CarouselItem>
                            <div className="p-1">
                              <img
                                src={placeholder}
                                alt="Imagen no disponible"
                                className="w-full h-64 object-cover rounded-md"
                              />
                            </div>
                          </CarouselItem>
                        )}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </Carousel>
                  </div>
                  <div className="order-1 md:order-2">
                    <ScrollArea className="h-[250px] md:h-[400px] w-full rounded-md border p-4">
                      <h4 className="font-semibold mb-2">Descripción</h4>
                      <p className="text-sm mb-4">{product.descripcion}</p>
                      <Separator className="my-4" />
                      <h4 className="font-semibold mb-2">Detalles</h4>
                      <ul className="text-sm space-y-2">
                        <li>
                          <strong>Precio:</strong> Q{product.precio.toFixed(2)}
                        </li>
                        <li>
                          <strong>Estado:</strong>
                          <Badge
                            variant={
                              product.stock && product.stock.cantidad > 0
                                ? "default"
                                : "destructive"
                            }
                            className="ml-2"
                          >
                            {product.stock && product.stock.cantidad > 0
                              ? "En stock"
                              : "Agotado"}
                          </Badge>
                        </li>
                        {product.stock && (
                          <li>
                            <strong>Cantidad disponible:</strong>{" "}
                            {product.stock.cantidad}
                          </li>
                        )}
                        <li>
                          <strong>Categorías:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {product.categorias.map((cat, index) => (
                              <Badge key={index} variant="outline">
                                {cat.categoria.nombre}
                              </Badge>
                            ))}
                          </div>
                        </li>
                      </ul>
                    </ScrollArea>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={() => setIsQuickViewOpen(false)}
                    variant="destructive"
                  >
                    Cerrar
                  </Button>
                  {/* <Button
                    onClick={() => {
                      addToCart(product);
                      setIsQuickViewOpen(false);
                    }}
                    disabled={!product.stock || product.stock.cantidad === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Añadir al Carrito
                  </Button> */}

                  <Button
                    onClick={() => addToCart(product)}
                    disabled={!product.stock || product.stock.cantidad === 0}
                    className="w-full"
                  >
                    {cart.some((prod) => prod.id === product.id) ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        En el carrito
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir al Carrito
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>

          {/* DETECTOR DE CARGA dentro de ScrollArea */}
          <div ref={loadMoreRef} className="h-16"></div>
        </ScrollArea>

        {isFetching && (
          <p className="text-center text-xl font-bold">CARGANDO...</p>
        )}
      </div>

      <Dialog open={openDialogSaleMade} onOpenChange={setOpenDialogSaleMade}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              Venta registrada exitosamente
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-white">
              Se ha registrado tu venta y ahora puedes generar un comprobante
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-500 dark:text-white">
              <span className="mr-2 font-medium">Numero de venta:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                #{saleMade?.id}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="mr-2 font-medium">Fecha y hora de venta:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatearFecha(saleMade?.timestamp)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-white">
              <Coins className="mr-2 h-4 w-4" />
              <span className="mr-2 font-medium">Total de la venta:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatearMoneda(saleMade?.monto)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-white">
              <Coins className="mr-2 h-4 w-4" />
              <span className="mr-2 font-medium">Monto con descuento:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatearMoneda(saleMade?.montoConDescuento)}
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="destructive"
              onClick={() => setOpenDialogSaleMade(false)}
              className="inline-flex items-center w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
            <Link to={`/comprobante-venta/${saleMade?.id}`}>
              <Button
                variant="default"
                className="inline-flex items-center w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Comprobante
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmSale} onOpenChange={setConfirmSale}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-xl font-semibold text-primary">
              <AlertTriangle className="w-6 h-6 mr-2 text-warning" />
              Confirmar Venta
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-muted-foreground">
              ¿Estás seguro de que deseas realizar esta venta?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
            <div className="space-y-2">
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <Coins className="w-4 h-4 mr-2 text-primary" />
                Total a pagar:{" "}
                <span className="font-semibold ml-1">
                  Q{calculateTotalConDescuento()}
                </span>
              </p>
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2 text-primary" />
                Cliente:{" "}
                <span className="font-semibold ml-1">
                  {registroAbierto
                    ? registroAbierto.cliente.nombre
                    : selectedCustomer?.nombre}
                </span>
              </p>
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4 mr-2 text-primary" />
                Método de pago:{" "}
                <span className="font-semibold ml-1">{selectedMetodPago}</span>
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
            <Button
              onClick={() => {
                if (registroAbierto) {
                  realizarVentaConVisita(cart);
                } else {
                  sendCartData(cart);
                }
              }}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar venta
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmSale(false)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

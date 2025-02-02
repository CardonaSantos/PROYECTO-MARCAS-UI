import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
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
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  Plus,
  Printer,
  Search,
  ShoppingCartIcon,
  Text,
  X,
  XIcon,
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
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string | undefined) => {
  let nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm:ss A");
  return nueva_fecha;
};

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
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedMetodPago, setSelectedMetodPago] = useState("CONTADO");

  const [products, setProducts] = useState<Producto[]>([]);
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

  // Obtener productos
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/product`);
        if (response.status === 200) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("No hay productos disponibles");
      }
    };

    getProducts();
  }, []);

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

  // Obtener clientes
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

  console.log(categoria);

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
      if (tokenUser) {
        try {
          const response = await axios.get(
            `${API_URL}/date/regist-open/${tokenUser.sub}`
          );

          if (response.status === 200) {
            const visitaData = response.data;

            // Actualiza el registro abierto
            setRegistroAbierto(visitaData);

            // Usa la data recibida directamente para actualizar el selectedCustomer
            setSelectedCustomer({
              id: visitaData?.cliente.id ?? 0, // Asegura que no sea undefined
              nombre: visitaData?.cliente.nombre ?? "", // Proporciona un valor por defecto si es undefined
              correo: visitaData?.cliente.correo ?? "",
              apellido: visitaData?.cliente.apellido ?? "",
              telefono: visitaData?.cliente.telefono ?? "",
              direccion: visitaData?.cliente.direccion ?? "",
              creadoEn: visitaData?.cliente.creadoEn ?? "",
              actualizadoEn: visitaData?.cliente.actualizadoEn ?? "",
              descuentos: visitaData?.cliente.descuentos ?? [], // Proporciona un arreglo vacío si es undefined
            });
          }
        } catch (error) {
          console.error("Error al obtener registro abierto:", error);
        }
      }
    };

    getRegistOpen();
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

  //   // Verifica que los campos requeridos estén completos
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
  //   console.log("Los datos a enviar son:");

  //   console.log({
  //     formateado,
  //     registroVisitaId: registroAbierto?.id,
  //   });

  //   try {
  //     setIsSubmitting(true); // Deshabilitar el botón
  //     console.log(formateado);
  //     const response = await axios.post(`${API_URL}/sale/sale-for-regis`, {
  //       ...formateado,
  //       registroVisitaId: registroAbierto?.id,
  //     });
  //     if (response.status === 200 || response.status === 201) {
  //       toast.success("Venta creada");
  //       clearCart();
  //       setIsSubmitting(false); // Habilitar el botón si la venta es exitosa
  //       setShowCartModal(false); // Opcional: cerrar el modal si la venta es exitosa
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Error al crear venta");
  //     setIsSubmitting(false); // Rehabilitar el botón si hay un error
  //   }
  //   console.log("La otra funcion nueva");
  //   console.log("El cart es: ", cart);
  //   console.log("El id de registro abierto es: ", registroAbierto?.id);
  // }
  async function realizarVentaConVisita(
    cart: (Producto & { quantity: number })[]
  ) {
    const formateado = formatoCartData(cart);

    console.log("La data a enviar es: ", formateado);

    // Validar campos requeridos
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
        !formateado.creditoInicial ||
        formateado.creditoInicial < 0
      ) {
        toast.info(
          "Datos de crédito inválidos. Revisa cuotas, interés y crédito inicial."
        );
        return;
      }
    }

    console.log("Datos a enviar:", {
      formateado,
      registroVisitaId: registroAbierto?.id,
    });

    try {
      setIsSubmitting(true); // Deshabilitar el botón
      const response = await axios.post(`${API_URL}/sale/sale-for-regis`, {
        ...formateado,
        registroVisitaId: registroAbierto?.id,
      });

      if (response.status === 200 || response.status === 201) {
        setSaleMade(response.data); // Guardar datos de la venta
        toast.success("Venta creada");
        clearCart();
        setIsSubmitting(false); // Habilitar el botón si la venta es exitosa
        setShowCartModal(false); // Cerrar el modal

        // Mostrar el diálogo después de un breve retraso
        setTimeout(() => {
          setOpenDialogSaleMade(true);
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear venta");
      setIsSubmitting(false); // Rehabilitar el botón si hay un error
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

  // const fechas =

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
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solicitar Descuento Personalizado */}
        <Card className="mb-1 shadow-xl">
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
        </Card>
      </div>

      {/* Método de Pago y Carrito */}
      <div className="w-full p-4 ">
        <Card className="mb-1 shadow-xl">
          <CardContent>
            <h3 className="text-md font-semibold mb-4 pt-2">Método de Pago</h3>

            <Select
              value={selectedMetodPago}
              onValueChange={setSelectedMetodPago}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="CONTADO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTADO">CONTADO</SelectItem>
                <SelectItem value="TARJETA">TARJETA</SelectItem>
                <SelectItem value="TRANSFERENCIA_BANCO">
                  TRANSFERENCIA BANCARIA
                </SelectItem>

                <SelectItem value="CREDITO">CREDITO</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowCartModal(true)}
              className="mt-4"
            >
              <ShoppingCartIcon className="mr-2" />
              Ver Carrito ({cart.length})
            </Button>

            <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carrito de Compras</DialogTitle>
                  <DialogDescription>
                    Estos son los productos que has añadido al carrito.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px]">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                      El carrito está vacío
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.nombre}</p>
                          <p>=</p>
                          <p className="text-sm text-muted-foreground">
                            Q{item.precio.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="1"
                            max={item.stock?.cantidad}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            className="w-16 mr-2"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <XIcon />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
                <DialogFooter className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="font-semibold">Total: Q{calculateTotal()}</p>
                    <p className="font-semibold">
                      Total con descuento: Q{calculateTotalConDescuento()}
                    </p>
                    <p className="font-semibold">
                      Descuento:{" "}
                      {selectedDiscount
                        ? `${selectedDiscount.porcentaje}%`
                        : "Descuento no seleccionado"}
                    </p>
                    <p className="font-semibold">
                      Cliente:{" "}
                      {registroAbierto
                        ? registroAbierto.cliente.nombre
                        : selectedCustomer?.nombre}
                    </p>
                    <p className="font-semibold">
                      Método de pago: {selectedMetodPago}
                    </p>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (registroAbierto) {
                          // Función para venta con visita abierta
                          realizarVentaConVisita(cart);
                        } else {
                          // Función convencional
                          sendCartData(cart);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Procesando..." : "Confirmar venta"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowCartModal(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </DialogFooter>
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
              <div className="p-6 mt-5 bg-gray-50 rounded-lg shadow-md dark:bg-transparent border-2">
                <h4 className="text-lg font-semibold mb-4 text-center text-primary">
                  Resumen del Crédito
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>Saldo Restante a Pagar:</strong>{" "}
                    {saldoRestante.toLocaleString("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                    })}
                  </p>
                  <p>
                    <strong>Monto sin interés:</strong>{" "}
                    {montoTotal.toLocaleString("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                    })}
                  </p>
                  <p>
                    <strong>Monto de Interés:</strong>{" "}
                    {montoInteres.toLocaleString("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                    })}
                  </p>
                  <p>
                    <strong>Monto Total con Interés:</strong>{" "}
                    {montoTotalConInteres.toLocaleString("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                    })}
                  </p>
                  <p>
                    <strong>Pago por Cada Cuota:</strong>{" "}
                    {pagoPorCuota.toLocaleString("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                    })}
                  </p>
                </div>
                <div className="">
                  {fechasDePago.length <= 0 ? (
                    <p className="text-sm font-thin py-2">
                      Ingrese el número de cuotas y los días entre pagos.
                    </p>
                  ) : (
                    <ul>
                      {fechasDePago.map((fecha, index) => (
                        <li key={index}>
                          <span className="font-bold">{index + 1}: </span>
                          <span className="">{fecha}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
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

        <ScrollArea className="h-[calc(100vh-300px)] shadow-xl rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="flex-grow p-4">
                    <div className="aspect-w-1 aspect-h-1 w-full mb-4">
                      <img
                        // src={product?.imagen || "/placeholder.svg"}
                        alt={product.nombre}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.codigoProducto}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {product.categorias.map((cat) => (
                        <Badge key={cat.categoria.id} variant="secondary">
                          {cat.categoria.nombre}
                        </Badge>
                      ))}
                    </div>
                    <p className="font-bold text-lg mb-2">
                      Q{product.precio.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      Stock:{" "}
                      {product.stock && product.stock.cantidad > 0 ? (
                        <Badge variant="outline">
                          {product.stock.cantidad}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Fuera de stock</Badge>
                      )}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.stock || product.stock.cantidad === 0}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir al Carrito
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
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
              variant="outline"
              onClick={() => setOpenDialogSaleMade(false)}
              className="inline-flex items-center"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
            <Link to={`/comprobante-venta/${saleMade?.id}`}>
              <Button variant="default" className="inline-flex items-center">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Comprobante
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

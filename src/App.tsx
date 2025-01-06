import "./App.css";
import Login from "./components/Auth/Login";
// import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
// import AdminDashboard from "./components/ComponentsMainDashboard/AdminDashboard";
// import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import CreateUser from "./components/Auth/CreateUser";
import { Toaster } from "sonner";
import Customers from "./Pages/Customers";
import Users from "./Pages/Users";
import Sales from "./Pages/Sales";
import Employees from "./Pages/Employees";
import SellerHistory from "./Pages/SellerHistory";
import CreateProduct from "./Pages/CreateProduct";
import StockPage from "./Pages/StockPage";
import ViewProducts from "./Pages/ViewProducts";
import MakeSale from "./Pages/MakeSale";
import HistorialVentas from "./Pages/SaleCard";
import CheckInCheckOut from "./Pages/CheckInCheckOut";
import CrearCategoria from "./Pages/CrearCategoria";
import CrearProveedor from "./Pages/CrearProveedor";
import StockDeliveryRecords from "./Pages/StockDeliveryRecords";
import CreateClient from "./Pages/CreateClient";
import ProspectoFormulario from "./Pages/ProspectoFormulario";
import ProspectoHistorial from "./Pages/ProspectoHistorial";
import ProspectoUbicacion from "./Pages/MapProspect/ProspectoUbicacion";
import PdfPage from "./components/PDF/PdfPage";
import DeliveryPdfPage from "./components/PDF/DeliveryPdfPage";
import EditCustomer from "./Pages/Tools/EditCustomer";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import DashboardEmp from "./Pages/DashboardEmployee/DashboardEmp";
import { ProtectedRouteAdmin } from "./components/Auth/ProtectedRouteAdmin";
import MySales from "./Pages/EmployePages/MySales";
import RegistroVisita from "./Pages/RegistroVisita";
import VisitasTable from "./Pages/Dates/VisitasTable";
import CustomerSales from "./Pages/CustomerSales/CustomerSales";
import Layout2 from "./components/Layout/Layout2";
import VentaPdfPage from "./components/PDF/VentasPDF/VentaPdfPage";
import EmpresaForm from "./Pages/Empresa/EmpresaForm";
import ChatsAnalytics from "./Pages/Analytics/ChatsAnalytics";
import Reportes from "./Pages/Reportes/Reportes";
import SolicitarRecuperacion from "./Pages/Recovery/SolicitarRecuperacion";
import RestablecerContrasena from "./Pages/Recovery/RestablecerContrasena";

function App() {
  return (
    <>
      <Router>
        {/* Notificaciones */}
        <Toaster position="top-right" richColors={true} duration={3000} />

        <Routes>
          {/* Redirecciona a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Rutas no protegidas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<CreateUser />} />

          {/* Rutas protegidas con Layout */}
          <Route element={<Layout2 />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRouteAdmin>
                  <Dashboard />
                </ProtectedRouteAdmin>
              }
            />

            <Route
              path="/dashboard-empleado"
              element={
                <ProtectedRoute>
                  <DashboardEmp />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comprobante-venta"
              element={
                <ProtectedRoute>
                  <PdfPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/empleados"
              element={
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial-citas"
              element={
                <ProtectedRoute>
                  <ProspectoHistorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial-empleados-check"
              element={
                <ProtectedRoute>
                  <SellerHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-productos"
              element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/asignar-stock"
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ver-productos"
              element={
                <ProtectedRoute>
                  <ViewProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hacer-ventas"
              element={
                <ProtectedRoute>
                  <MakeSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial-ventas"
              element={
                <ProtectedRoute>
                  <HistorialVentas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registrar-entrada-salida"
              element={
                <ProtectedRoute>
                  <CheckInCheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-categoria"
              element={
                <ProtectedRoute>
                  <CrearCategoria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-proveedor"
              element={
                <ProtectedRoute>
                  <CrearProveedor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-cliente"
              element={
                <ProtectedRoute>
                  <CreateClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registro-entregas"
              element={
                <ProtectedRoute>
                  <StockDeliveryRecords />
                </ProtectedRoute>
              }
            />

            <Route
              path="/prospecto"
              element={
                <ProtectedRoute>
                  <ProspectoFormulario />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prospecto-ubicacion"
              element={
                <ProtectedRoute>
                  <ProspectoUbicacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conseguir-comprobante-entrega"
              element={
                <ProtectedRoute>
                  <DeliveryPdfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editar-cliente/:id"
              element={
                <ProtectedRoute>
                  <EditCustomer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mis-ventas"
              element={
                <ProtectedRoute>
                  <MySales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/visita"
              element={
                <ProtectedRoute>
                  <RegistroVisita />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historial-visitas"
              element={
                <ProtectedRoute>
                  <VisitasTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historial-cliente-ventas/:id"
              element={
                <ProtectedRoute>
                  <CustomerSales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/comprobante-venta/:id"
              element={
                <ProtectedRoute>
                  <VentaPdfPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/empresa-info"
              element={
                <ProtectedRoute>
                  <EmpresaForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analisis"
              element={
                <ProtectedRoute>
                  <ChatsAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recovery"
              element={
                // <ProtectedRoute>
                <SolicitarRecuperacion />
                // </ProtectedRoute>
              }
            />

            <Route
              path="/restablecer-contraseña"
              element={
                // <ProtectedRoute>
                <RestablecerContrasena />
                // </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

// ACTUALIZAR LA CREACION DE CLIENTES,
// Creacion de flujo de visita a cliente,
// Solucionar el error de prospectos historial mapa,
// Filtros,
// Check empleados historial, mejorar y filtros,
// Mejorar el card de venta, modelar el PDF, poner filtros,
// gestion de unstable_useViewTransitionState mejorar,
// clientes mejorar vista, filtros,
// dashboard, poner totales y otros
// notificacines,
//PROVEEDORES MEJORAR
// flujo de peticion de porcentajes

export default App;

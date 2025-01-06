import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Asegúrate de importar jwtDecode correctamente

interface ProtectedRouteProps {
  children: ReactNode;
}

interface UserTokenInfo {
  nombre: string;
  correo: string;
  rol: string;
  sub: number;
  activo: boolean;
}

export function ProtectedRouteAdmin({ children }: ProtectedRouteProps) {
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

  const isAuth = localStorage.getItem("authToken") !== null;

  // Si no está autenticado, redirigir a login
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // Si no es administrador, redirigir al dashboard de empleado
  if (tokenUser && tokenUser?.rol !== "ADMIN") {
    return <Navigate to="/dashboard-empleado" />;
  }

  // Si está autenticado y es admin, renderizar el contenido
  return <>{children}</>;
}

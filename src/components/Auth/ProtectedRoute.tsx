import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = localStorage.getItem("authToken") !== null;

  // Si no está autenticado, redirigir al login
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado, renderizar el contenido
  return <>{children}</>;
}

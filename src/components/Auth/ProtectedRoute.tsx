// import { Navigate } from "react-router-dom";
// import { ReactNode } from "react";
// import { useStore } from "@/Context/ContextSucursal";

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// export function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const isAuth = localStorage.getItem("authToken") !== null;
//   const rolUser = useStore((state) => state.setRol);
//   // Si no está autenticado, redirigir al login

//   if (!rolUser) {
//     console.log("No hay rol, no hay logueo");
//     return <Navigate to={"/login"}></Navigate>;
//   }

//   if (!isAuth) {
//     return <Navigate to="/login" />;
//   }

//   // Si está autenticado, renderizar el contenido
//   return <>{children}</>;
// }
import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useStore } from "@/Context/ContextSucursal";
import gif from "@/assets/images/loading.gif";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = localStorage.getItem("authToken") !== null;
  const rolUser = useStore((state) => state.userRol); // Obtener el rol correctamente
  const [isLoading, setIsLoading] = useState(true);

  // Esperamos a que el rol esté disponible
  useEffect(() => {
    if (rolUser !== undefined) {
      setIsLoading(false);
    }
  }, [rolUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <img src={gif} alt="Cargando..." className="w-16 h-16 object-contain" />
        <p className="text-lg font-semibold text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!rolUser || !isAuth) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

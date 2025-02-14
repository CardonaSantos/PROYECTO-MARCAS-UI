// import { Navigate } from "react-router-dom";
// import { ReactNode } from "react";
// import { useStore } from "@/Context/ContextSucursal";

// interface ProtectedRouteAdminProps {
//   children: ReactNode;
// }

// export function ProtectedRouteAdmin({ children }: ProtectedRouteAdminProps) {
//   const rolUser = useStore((state) => state.userRol); // Obtener el rol correctamente

//   if (rolUser !== "ADMIN") {
//     return <Navigate to="/dashboard-empleado" />; // Redirigir a empleados si no es admin
//   }

//   return <>{children}</>;
// }
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useStore } from "@/Context/ContextSucursal";
import { useEffect, useState } from "react";
import gif from "@/assets/images/loading.gif";

interface ProtectedRouteAdminProps {
  children: ReactNode;
}

export function ProtectedRouteAdmin({ children }: ProtectedRouteAdminProps) {
  const rolUser = useStore((state) => state.userRol); // Obtener el rol
  const [isLoading, setIsLoading] = useState(true);

  // Simulamos una espera para asegurarnos de que el rol esté disponible
  useEffect(() => {
    if (rolUser !== undefined) {
      setIsLoading(false);
    }
  }, [rolUser]);

  if (isLoading) {
    return (
      // <div className="flex justify-center items-center h-screen">
      //   Cargando...
      // </div>
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <img src={gif} alt="Cargando..." className="w-16 h-16 object-contain" />
        <p className="text-lg font-semibold text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (rolUser !== "ADMIN") {
    return <Navigate to="/dashboard-empleado" />;
  }

  return <>{children}</>;
}

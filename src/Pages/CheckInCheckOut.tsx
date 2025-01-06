import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // No desestructurar aquí
import { CheckInToday } from "../Utils/Types/CheckInToday";
import { UserToken } from "../Utils/Types/UserTokenInfo";
import { format } from "date-fns"; // Importar differenceInMinutes también
import { es } from "date-fns/locale"; // Importar el idioma español
import { AlertTriangle, Check, Clock, LogIn, LogOut, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const MIURLSERVER = import.meta.env.VITE_API_URL;
function CheckInCheckOut() {
  console.log("Esta es la api: ", API_URL);

  console.log("ESTA ES MI URL DEL SERVIDOR: ", MIURLSERVER);

  const [user, setUser] = useState<UserToken | null>(null);
  const [registro, setRegistro] = useState<CheckInToday | null>(null);
  const [showEntradaConfirm, setShowEntradaConfirm] = useState(false);
  const [showSalidaConfirm, setShowSalidaConfirm] = useState(false);

  const UserToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (UserToken) {
      try {
        const decodedUser: UserToken = jwtDecode(UserToken);
        setUser(decodedUser); // Asegurarse de que jwtDecode esté decodificando correctamente
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [UserToken]);

  useEffect(() => {
    if (user && user.sub) {
      getTodayCheck(); // Sólo llama a la función si el user está disponible y tiene ID
    }
  }, [user]); // 'user' es la dependencia aquí

  const getTodayCheck = async () => {
    if (!user || !user.sub) return; // Verifica si el usuario y su ID están definidos

    try {
      const response = await axios.get(
        `${API_URL}/attendance/today-check/${user.sub}`
      );
      if (response.status === 200 || response.status === 201) {
        setRegistro(response.data);
      }
    } catch (error) {
      toast.info("No se ha creado ningún registro de entrada hoy");
    }
  };

  const registrarEntrada = async () => {
    if (!user) return; // Verifica que el usuario esté definido antes de hacer la solicitud
    try {
      const fechaActual = new Date();
      const payload = {
        usuarioId: user?.sub,
        fecha: fechaActual.toISOString().split("T")[0] + "T00:00:00.000Z",
        entrada: fechaActual.toISOString(),
      };

      const response = await axios.post(
        `${API_URL}/attendance/check-in`,
        payload
      );

      if (response.status === 201) {
        toast.success("Entrada registrada");
        getTodayCheck(); // Actualiza el registro después de hacer check-in
      }
    } catch (error) {
      toast.error("Ya se han creado todos los registros de este día");
    }
  };

  const registrarSalida = async () => {
    if (!user) return; // Verifica que el usuario esté definido antes de hacer la solicitud
    try {
      const fechaActual = new Date();
      const payload = {
        fecha: fechaActual.toISOString().split("T")[0] + "T00:00:00.000Z",
        salida: fechaActual.toISOString(),
      };

      const response = await axios.patch(
        `${API_URL}/attendance/check-out/${registro?.id}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Salida registrada con éxito");
        getTodayCheck(); // Actualiza el registro después de hacer check-out
      }
    } catch (error) {
      toast.error("Ya se han creado todos los registros de este día");
    }
  };
  console.log(registro);

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <Card className="w-full max-w-md shadow-xl  rounded-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <Clock className="mr-2" />
            Registro de Entrada y Salida
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6">
          <Button
            className="w-full bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            onClick={() => setShowEntradaConfirm(true)}
            disabled={!!registro?.entrada}
            aria-label="Registrar entrada"
          >
            <LogIn className="mr-2" />
            Registrar Entrada
          </Button>

          {registro?.entrada && (
            <div className="text-center bg-gray-100 p-4 rounded-lg w-full">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                Se ha marcado tu entrada
              </h2>
              <p className="text-xl font-semibold text-gray-900 flex items-center justify-center">
                <Clock className="mr-2" />
                {format(new Date(registro.entrada), "hh:mm a", { locale: es })}
              </p>
            </div>
          )}

          <Button
            className="w-full bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            onClick={() => setShowSalidaConfirm(true)}
            disabled={!registro?.entrada || !!registro?.salida}
            aria-label="Registrar salida"
          >
            <LogOut className="mr-2" />
            Registrar Salida
          </Button>

          {registro?.salida && (
            <div className="text-center bg-gray-100 p-4 rounded-lg w-full">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                Se ha marcado tu salida
              </h2>
              <p className="text-xl font-semibold text-gray-900 flex items-center justify-center">
                <Clock className="mr-2" />
                {format(new Date(registro.salida), "hh:mm a", { locale: es })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEntradaConfirm} onOpenChange={setShowEntradaConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center justify-center">
              <AlertTriangle className="mr-2 text-yellow-500" />
              Confirmar Registro de Entrada
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro que deseas registrar tu entrada?
            </p>
            <div className="flex justify-between items-center space-x-4">
              <Button
                className="flex-1 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 text-gray-700 font-semibold py-2 rounded-lg transition-colors duration-300"
                onClick={() => setShowEntradaConfirm(false)}
              >
                <X className="mr-2" />
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                onClick={() => {
                  setShowEntradaConfirm(false);
                  registrarEntrada();
                }}
              >
                <Check className="mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSalidaConfirm} onOpenChange={setShowSalidaConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center justify-center">
              <AlertTriangle className="mr-2 text-yellow-500" />
              Confirmar Registro de Salida
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro que deseas registrar tu salida?
            </p>
            <div className="flex justify-between items-center space-x-4">
              <Button
                className="flex-1 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 text-gray-700 font-semibold py-2 rounded-lg transition-colors duration-300"
                onClick={() => setShowSalidaConfirm(false)}
              >
                <X className="mr-2" />
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                onClick={() => {
                  setShowSalidaConfirm(false);
                  registrarSalida();
                }}
              >
                <Check className="mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CheckInCheckOut;

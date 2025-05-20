import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Check, Clock, LogIn, LogOut, X } from "lucide-react";
// import { useStore } from "@/Context/ContextSucursal";
import { CheckInToday } from "../Utils/Types/CheckInToday";
import { UserToken } from "../Utils/Types/UserTokenInfo";

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckInCheckOut() {
  // Estados
  const [user, setUser] = useState<UserToken | null>(null);
  const [registro, setRegistro] = useState<CheckInToday | null>(null);
  const [loading, setLoading] = useState(true);

  const [showEntradaConfirm, setShowEntradaConfirm] = useState(false);
  const [showSalidaConfirm, setShowSalidaConfirm] = useState(false);

  const [isSubmittingCheck, setIsSubmittingCheck] = useState(false);
  const [isClosingCheck, setIsClosingCheck] = useState(false);

  // Para bloquear doble-click instantáneo
  const entryRef = useRef(false);
  const exitRef = useRef(false);

  // Obtenemos token y user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        setUser(jwtDecode<UserToken>(token));
      } catch {
        console.error("Token inválido");
      }
    }
  }, []);

  // Función para traer el registro de hoy
  const getTodayCheck = useCallback(async () => {
    if (!user?.sub) return;
    setLoading(true);
    try {
      const { data, status } = await axios.get<CheckInToday>(
        `${API_URL}/attendance/today-check/${user.sub}`
      );
      setRegistro(status >= 200 && status < 300 ? data : null);
    } catch {
      setRegistro(null);
    } finally {
      setLoading(false);
      // Reset refs para permitir nuevas operaciones
      entryRef.current = false;
      exitRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    getTodayCheck();
  }, [getTodayCheck]);

  // Registrar entrada
  const registrarEntrada = useCallback(async () => {
    if (!user?.sub || entryRef.current) return;
    entryRef.current = true;
    setIsSubmittingCheck(true);

    try {
      const now = new Date();
      await axios.post(`${API_URL}/attendance/check-in`, {
        usuarioId: user.sub,
        fecha: now.toISOString().split("T")[0] + "T00:00:00.000Z",
        entrada: now.toISOString(),
      });
      toast.success("Entrada registrada");
      await getTodayCheck();
      setShowEntradaConfirm(false);
    } catch (e) {
      toast.error("No se pudo registrar la entrada");
    } finally {
      setIsSubmittingCheck(false);
    }
  }, [user, getTodayCheck]);

  // Registrar salida
  const registrarSalida = useCallback(async () => {
    if (!registro?.id || exitRef.current) return;
    exitRef.current = true;
    setIsClosingCheck(true);

    try {
      const now = new Date();
      await axios.patch(`${API_URL}/attendance/check-out/${registro.id}`, {
        fecha: now.toISOString().split("T")[0] + "T00:00:00.000Z",
        salida: now.toISOString(),
      });
      toast.success("Salida registrada");
      await getTodayCheck();
      setShowSalidaConfirm(false);
    } catch {
      toast.error("No se pudo registrar la salida");
    } finally {
      setIsClosingCheck(false);
    }
  }, [registro, getTodayCheck]);

  return (
    <div className="container flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-center flex items-center">
            <Clock className="mr-2" /> Registro de Entrada y Salida
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6">
          {loading ? (
            <p>Cargando registro…</p>
          ) : (
            <>
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg"
                onClick={() => setShowEntradaConfirm(true)}
                disabled={!!registro?.entrada}
              >
                <LogIn className="mr-2" /> Registrar Entrada
              </Button>
              {registro?.entrada && (
                <div className="bg-gray-100 p-4 rounded-lg w-full text-center text-black">
                  <p className="font-bold">Entrada marcada:</p>
                  <p className="flex items-center justify-center">
                    <Clock className="mr-2" />
                    {format(new Date(registro.entrada), "hh:mm a", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
                onClick={() => setShowSalidaConfirm(true)}
                disabled={!registro?.entrada || !!registro?.salida}
              >
                <LogOut className="mr-2" /> Registrar Salida
              </Button>
              {registro?.salida && (
                <div className="bg-gray-100 p-4 rounded-lg w-full text-center">
                  <p className="font-bold">Salida marcada:</p>
                  <p className="flex items-center justify-center">
                    <Clock className="mr-2" />
                    {format(new Date(registro.salida), "hh:mm a", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Confirmar Entrada */}
      <Dialog open={showEntradaConfirm} onOpenChange={setShowEntradaConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center">
              <AlertTriangle className="mr-2 text-yellow-500" />
              Confirmar Entrada
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p>¿Deseas registrar tu entrada?</p>
            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:text-black text-black"
                onClick={() => setShowEntradaConfirm(false)}
                disabled={isSubmittingCheck}
              >
                <X className="mr-2" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={registrarEntrada}
                disabled={isSubmittingCheck}
              >
                {isSubmittingCheck ? (
                  "Registrando..."
                ) : (
                  <>
                    <Check className="mr-2" /> Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Salida */}
      <Dialog open={showSalidaConfirm} onOpenChange={setShowSalidaConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center">
              <AlertTriangle className="mr-2 text-yellow-500" />
              Confirmar Salida
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p>¿Deseas registrar tu salida?</p>
            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:text-black text-black"
                onClick={() => setShowSalidaConfirm(false)}
                disabled={isClosingCheck}
              >
                <X className="mr-2" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={registrarSalida}
                disabled={isClosingCheck}
              >
                {isClosingCheck ? (
                  "Registrando..."
                ) : (
                  <>
                    <Check className="mr-2" /> Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

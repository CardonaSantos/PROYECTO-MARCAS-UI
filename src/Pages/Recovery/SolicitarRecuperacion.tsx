import { useState } from "react";
import axios from "axios";

function SolicitarRecuperacion() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/recovery`, { correo });

      if (response.status === 200) {
        setMensaje("Se envió un enlace a tu correo.");
      } else {
        setMensaje("Error al solicitar recuperación.");
      }
    } catch (error: any) {
      console.error(error);
      setMensaje(
        error.response?.data?.message || "Error al procesar tu solicitud."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Ingresa tu correo"
        className="text-black border px-4 py-2 rounded w-full"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Enviar
      </button>
      {mensaje && <p className="text-sm text-gray-700">{mensaje}</p>}
    </form>
  );
}

export default SolicitarRecuperacion;

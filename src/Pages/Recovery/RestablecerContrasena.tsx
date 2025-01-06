import { useState } from "react";
import { useSearchParams } from "react-router-dom";

function RestablecerContrasena() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaContrasena }),
      });

      if (response.ok) {
        setMensaje("Contraseña restablecida con éxito.");
      } else {
        setMensaje("Error al restablecer la contraseña.");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al procesar tu solicitud.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={nuevaContrasena}
        onChange={(e) => setNuevaContrasena(e.target.value)}
        required
      />
      <button type="submit">Restablecer</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}

export default RestablecerContrasena;

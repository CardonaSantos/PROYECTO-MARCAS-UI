import { useStore } from "@/Context/ContextSucursal";

function Cancelados() {
  const userId = useStore((state) => state.sucursalId) ?? 0;

  console.log("El id de mi USUARIO LOGUEADO ES: ", userId);

  return (
    <div>
      <h2>Aqui iran mis tabs para ver los prospectos y visitas canceladas</h2>
    </div>
  );
}

export default Cancelados;

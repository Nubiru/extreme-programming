import { createServer } from "node:http";
import { crearAplicacion } from "./http/aplicacion.ts";

/**
 * Punto de entrada: lo único que hace es elegir el puerto y escuchar.
 * Toda la conducta vive en `crearAplicacion`, que las pruebas usan sin abrir
 * un puerto fijo ni depender de este archivo.
 */
const puerto = Number(process.env.PORT ?? 3000);

const servidor = createServer(crearAplicacion());

servidor.listen(puerto, () => {
  console.log(`Servidor disponible en http://localhost:${puerto}`);
});

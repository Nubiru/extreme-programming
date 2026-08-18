import { createServer, type RequestListener, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * Levanta la aplicación en un puerto libre (0 = lo elige el sistema) y devuelve
 * una función `pedir` que resuelve rutas relativas contra ese puerto.
 *
 * Cada prueba obtiene su propio servidor: así quedan aisladas y pueden
 * ejecutarse en cualquier orden.
 */
export interface ServidorDePrueba {
  pedir(ruta: string, opciones?: RequestInit): Promise<Response>;
  cerrar(): Promise<void>;
}

export async function levantar(manejador: RequestListener): Promise<ServidorDePrueba> {
  const servidor: Server = createServer(manejador);

  await new Promise<void>((listo) => servidor.listen(0, "127.0.0.1", listo));

  const { port } = servidor.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  return {
    pedir: (ruta, opciones) => fetch(`${base}${ruta}`, opciones),
    cerrar: () => new Promise<void>((listo) => servidor.close(() => listo()))
  };
}

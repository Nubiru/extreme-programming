import { After, Before, setWorldConstructor, World } from "@cucumber/cucumber";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { crearApp } from "../../src/app.ts";
import { crearBaseDeDatos } from "../../src/db/database.ts";
import { ProductosRepositorySqlite } from "../../src/productos/productos.repository.ts";
import { ProductosService } from "../../src/productos/productos.service.ts";
import { PedidosRepositorySqlite } from "../../src/pedidos/pedidos.repository.ts";
import { PedidosService } from "../../src/pedidos/pedidos.service.ts";

/**
 * El "mundo" es el estado compartido por los pasos de un escenario.
 * Antes de cada escenario se levanta la aplicación completa sobre una base
 * SQLite en memoria nueva, en un puerto efímero: los pasos solo conocen
 * el contrato HTTP, igual que un cliente real.
 */
export class MundoDePruebas extends World {
  servidor!: Server;
  base!: string;
  respuesta!: Response;
  cuerpo: any;

  async pedir(ruta: string, opciones?: RequestInit): Promise<void> {
    this.respuesta = await fetch(this.base + ruta, opciones);
    this.cuerpo =
      this.respuesta.status === 204 ? undefined : await this.respuesta.json();
  }

  async pedirJson(metodo: string, ruta: string, cuerpo: unknown): Promise<void> {
    await this.pedir(ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });
  }
}

setWorldConstructor(MundoDePruebas);

Before(function (this: MundoDePruebas) {
  const db = crearBaseDeDatos(":memory:");
  const productosRepository = new ProductosRepositorySqlite(db);
  const pedidosRepository = new PedidosRepositorySqlite(db);
  const app = crearApp({
    productosService: new ProductosService(productosRepository),
    pedidosService: new PedidosService(pedidosRepository, productosRepository)
  });
  return new Promise<void>((resolver) => {
    this.servidor = app.listen(0, () => {
      const { port } = this.servidor.address() as AddressInfo;
      this.base = `http://127.0.0.1:${port}`;
      resolver();
    });
  });
});

After(function (this: MundoDePruebas) {
  return new Promise<void>((resolver, rechazar) => {
    this.servidor.close((error) => (error ? rechazar(error) : resolver()));
  });
});

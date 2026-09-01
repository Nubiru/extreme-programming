import { crearApp } from "./app.ts";
import { crearBaseDeDatos } from "./db/database.ts";
import { ProductosRepositorySqlite } from "./productos/productos.repository.ts";
import { ProductosService } from "./productos/productos.service.ts";
import { PedidosRepositorySqlite } from "./pedidos/pedidos.repository.ts";
import { PedidosService } from "./pedidos/pedidos.service.ts";

/**
 * Raíz de composición: acá se arma el grafo de dependencias real
 * (SQLite → repositorios → servicios → aplicación) y se escucha el puerto.
 */
const db = crearBaseDeDatos(process.env.DB_PATH ?? "datos.db");

const productosRepository = new ProductosRepositorySqlite(db);
const productosService = new ProductosService(productosRepository);
const pedidosRepository = new PedidosRepositorySqlite(db);
const pedidosService = new PedidosService(pedidosRepository, productosRepository);

const app = crearApp({ productosService, pedidosService });

const puerto = Number(process.env.PORT ?? 3000);
app.listen(puerto, () => {
  console.log("app")
  console.log(`API disponible en http://localhost:${puerto}/api/v1`);
});

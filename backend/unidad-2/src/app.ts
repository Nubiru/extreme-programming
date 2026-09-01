import express from "express";
import type { Express } from "express";
import { errorHandler } from "./middlewares/error-handler.ts";
import { notFound } from "./middlewares/not-found.ts";
import { ProductosController } from "./productos/productos.controller.ts";
import { crearProductosRouter } from "./productos/productos.routes.ts";
import type { ProductosService } from "./productos/productos.service.ts";
import { PedidosController } from "./pedidos/pedidos.controller.ts";
import { crearPedidosRouter } from "./pedidos/pedidos.routes.ts";
import type { PedidosService } from "./pedidos/pedidos.service.ts";

export interface Servicios {
  productosService: ProductosService;
  pedidosService: PedidosService;
}

/**
 * Construye la aplicación Express a partir de los servicios inyectados.
 * Las pruebas la crean con repositorios sobre SQLite en memoria o simulados,
 * sin abrir ningún puerto.
 */
export function crearApp({ productosService, pedidosService }: Servicios): Express {
  const app = express();
  app.use(express.json());

  // Índice de la API: orienta a quien entra a /api/v1 desde el navegador.
  app.get("/api/v1", (_request, response) => {
    response.status(200).json({
      data: {
        nombre: "API Unidad 2",
        recursos: ["/api/v1/productos", "/api/v1/pedidos"]
      }
    });
  });

  app.use("/api/v1/productos", crearProductosRouter(new ProductosController(productosService)));
  app.use("/api/v1/pedidos", crearPedidosRouter(new PedidosController(pedidosService)));
  console.log("app");
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

import { Router } from "express";
import type { PedidosController } from "./pedidos.controller.ts";

export function crearPedidosRouter(controller: PedidosController): Router {
  const router = Router();
  router.get("/", controller.obtenerTodos);
  router.get("/:id", controller.obtenerPorId);
  router.post("/", controller.crear);
  router.patch("/:id", controller.actualizar);
  router.delete("/:id", controller.eliminar);
  return router;
}

import type { Request, Response } from "express";
import { validarId } from "../comun/validar-id.ts";
import { validarCrearProducto, validarActualizarProducto } from "./productos.dto.ts";
import type { ProductosService } from "./productos.service.ts";

/**
 * El controlador traduce HTTP a llamadas de aplicación: lee parámetros y
 * cuerpos, invoca validadores y servicio, y elige código de estado y respuesta.
 */
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  obtenerTodos = (request: Request, response: Response): void => {
    const q = typeof request.query.q === "string" ? request.query.q : undefined;
    response.status(200).json({ data: this.service.obtenerTodos(q) });
  };

  obtenerPorId = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    response.status(200).json({ data: this.service.obtenerPorId(id) });
  };

  crear = (request: Request, response: Response): void => {
    const dto = validarCrearProducto(request.body);
    const producto = this.service.crear(dto);
    console.log("controlador");
    response
      .location(`/api/v1/productos/${producto.id}`)
      .status(201)
      .json({ data: producto });
  };

  reemplazar = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    const dto = validarCrearProducto(request.body);
    response.status(200).json({ data: this.service.reemplazar(id, dto) });
  };

  actualizar = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    const dto = validarActualizarProducto(request.body);
    response.status(200).json({ data: this.service.actualizar(id, dto) });
  };

  eliminar = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    this.service.eliminar(id);
    response.status(204).send();
  };
}

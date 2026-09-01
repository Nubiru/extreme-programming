import type { Request, Response } from "express";
import { validarId } from "../comun/validar-id.ts";
import { validarCrearPedido, validarActualizarPedido } from "./pedidos.dto.ts";
import type { PedidosService } from "./pedidos.service.ts";

export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  obtenerTodos = (_request: Request, response: Response): void => {
    response.status(200).json({ data: this.service.obtenerTodos() });
  };

  obtenerPorId = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    response.status(200).json({ data: this.service.obtenerPorId(id) });
  };

  crear = (request: Request, response: Response): void => {
    const dto = validarCrearPedido(request.body);
    const pedido = this.service.crear(dto);
    response
      .location(`/api/v1/pedidos/${pedido.id}`)
      .status(201)
      .json({ data: pedido });
  };

  actualizar = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    const dto = validarActualizarPedido(request.body);
    response.status(200).json({ data: this.service.actualizar(id, dto) });
  };

  eliminar = (request: Request, response: Response): void => {
    const id = validarId(request.params.id);
    this.service.eliminar(id);
    response.status(204).send();
  };
}

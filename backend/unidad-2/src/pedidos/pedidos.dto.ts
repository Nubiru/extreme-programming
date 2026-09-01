import { AppError } from "../errors/app-error.ts";
import type { EstadoPedido } from "./pedido.ts";

/** DTO de entrada para crear un pedido. El estado inicial lo decide el servidor. */
export interface CrearPedidoDto {
  productoId: number;
  cantidad: number;
}

/** DTO de entrada para modificar parcialmente un pedido (PATCH). */
export interface ActualizarPedidoDto {
  cantidad?: number;
  estado?: EstadoPedido;
}

const ESTADOS: EstadoPedido[] = ["pendiente", "enviado", "entregado"];

function comoObjeto(datos: unknown): Record<string, unknown> {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new AppError(400, "CUERPO_INVALIDO", "El cuerpo debe ser un objeto JSON");
  }
  return datos as Record<string, unknown>;
}

function validarCantidad(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(422, "CANTIDAD_INVALIDA", "La cantidad debe ser un entero mayor que cero");
  }
  return valor;
}

export function validarCrearPedido(datos: unknown): CrearPedidoDto {
  const objeto = comoObjeto(datos);
  if (
    typeof objeto.productoId !== "number" ||
    !Number.isInteger(objeto.productoId) ||
    objeto.productoId <= 0
  ) {
    throw new AppError(422, "PRODUCTO_ID_INVALIDO", "productoId debe ser un entero positivo");
  }
  return {
    productoId: objeto.productoId,
    cantidad: validarCantidad(objeto.cantidad)
  };
}

export function validarActualizarPedido(datos: unknown): ActualizarPedidoDto {
  const objeto = comoObjeto(datos);
  const dto: ActualizarPedidoDto = {};
  if ("cantidad" in objeto) dto.cantidad = validarCantidad(objeto.cantidad);
  if ("estado" in objeto) {
    if (typeof objeto.estado !== "string" || !ESTADOS.includes(objeto.estado as EstadoPedido)) {
      throw new AppError(422, "ESTADO_INVALIDO", "El estado debe ser pendiente, enviado o entregado");
    }
    dto.estado = objeto.estado as EstadoPedido;
  }
  if (Object.keys(dto).length === 0) {
    throw new AppError(422, "SIN_CAMBIOS", "Debe enviarse al menos un campo para modificar");
  }
  return dto;
}

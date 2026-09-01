import { AppError } from "../errors/app-error.ts";

/** DTO de entrada para crear (o reemplazar con PUT) un producto. */
export interface CrearProductoDto {
  nombre: string;
  precio: number;
  stock: number;
}

/** DTO de entrada para modificar parcialmente un producto (PATCH). */
export interface ActualizarProductoDto {
  nombre?: string;
  precio?: number;
  stock?: number;
}

function comoObjeto(datos: unknown): Record<string, unknown> {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new AppError(400, "CUERPO_INVALIDO", "El cuerpo debe ser un objeto JSON");
  }
  return datos as Record<string, unknown>;
}

function validarNombre(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length < 3) {
    throw new AppError(422, "NOMBRE_INVALIDO", "El nombre debe tener al menos tres caracteres");
  }
  return valor.trim();
}

function validarPrecio(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new AppError(422, "PRECIO_INVALIDO", "El precio debe ser un número mayor que cero");
  }
  return valor;
}

function validarStock(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < 0) {
    throw new AppError(422, "STOCK_INVALIDO", "El stock debe ser un entero mayor o igual a cero");
  }
  return valor;
}

export function validarCrearProducto(datos: unknown): CrearProductoDto {
  const objeto = comoObjeto(datos);
  return {
    nombre: validarNombre(objeto.nombre),
    precio: validarPrecio(objeto.precio),
    stock: validarStock(objeto.stock)
  };
}

export function validarActualizarProducto(datos: unknown): ActualizarProductoDto {
  const objeto = comoObjeto(datos);
  const dto: ActualizarProductoDto = {};
  if ("nombre" in objeto) dto.nombre = validarNombre(objeto.nombre);
  if ("precio" in objeto) dto.precio = validarPrecio(objeto.precio);
  if ("stock" in objeto) dto.stock = validarStock(objeto.stock);
  if (Object.keys(dto).length === 0) {
    throw new AppError(422, "SIN_CAMBIOS", "Debe enviarse al menos un campo para modificar");
  }
  return dto;
}

import { AppError } from "../errors/app-error.ts";

/** Valida el parámetro de ruta :id. Un id no numérico es una solicitud mal formada (400). */
export function validarId(valor: unknown): number {
  const id = typeof valor === "string" ? Number(valor) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "ID_INVALIDO", "El identificador no es válido");
  }
  return id;
}

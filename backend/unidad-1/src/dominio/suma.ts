/** Único mensaje de rechazo: el contrato de error también es parte del dominio. */
export const MENSAJE_ARGUMENTOS_INVALIDOS = "Ambos argumentos deben ser números";

/**
 * Suma dos números.
 *
 * Acepta `unknown` a propósito: en el borde del sistema los datos llegan de
 * formularios, JSON o parámetros de consulta, donde un `2` puede ser el texto
 * "2". Validar acá evita que un `"2" + 3 === "23"` se propague como si fuera
 * un total válido.
 *
 * @throws {TypeError} si alguno de los argumentos no es un número utilizable.
 */
export function suma(a: unknown, b: unknown): number {
  if (typeof a !== "number" || typeof b !== "number" || Number.isNaN(a) || Number.isNaN(b)) {
    throw new TypeError(MENSAJE_ARGUMENTOS_INVALIDOS);
  }

  return a + b;
}

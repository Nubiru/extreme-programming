/**
 * Fixture compartido: los ejemplos que definen la conducta de `suma`.
 *
 * Vive junto a los ayudantes de prueba y no dentro de `features/` porque lo
 * consumen los dos corredores: Vitest lo recorre con `it.each` y Cucumber lo usa
 * para el mensaje de error. Un solo lugar donde corregir un ejemplo.
 */

// El mensaje se reexporta desde el dominio: la dependencia va de la prueba al
// código, nunca al revés.
export { MENSAJE_ARGUMENTOS_INVALIDOS } from "../dominio/suma.ts";

export interface CasoValido {
  a: number;
  b: number;
  esperado: number;
  descripcion: string;
}

export interface CasoInvalido {
  a: unknown;
  b: unknown;
  descripcion: string;
}

/** Casos que la calculadora debe resolver. */
export const CASOS_VALIDOS: CasoValido[] = [
  { a: 2, b: 3, esperado: 5, descripcion: "dos enteros positivos" },
  { a: -1, b: -4, esperado: -5, descripcion: "dos enteros negativos" },
  { a: -3, b: 3, esperado: 0, descripcion: "opuestos que se anulan" },
  { a: 0, b: 0, esperado: 0, descripcion: "el elemento neutro" },
  { a: 2.5, b: 2.5, esperado: 5, descripcion: "decimales sin error de redondeo" }
];

/** Casos que la calculadora debe rechazar con un error, no con un resultado raro. */
export const CASOS_INVALIDOS: CasoInvalido[] = [
  { a: "2", b: 3, descripcion: "un número escrito como texto" },
  { a: 5, b: undefined, descripcion: "falta el segundo argumento" },
  { a: undefined, b: undefined, descripcion: "faltan los dos argumentos" },
  { a: null, b: 5, descripcion: "un valor nulo" },
  { a: NaN, b: 5, descripcion: "un valor que no es un número" },
  { a: true, b: 5, descripcion: "un booleano" }
];

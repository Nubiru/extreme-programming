/**
 * Vector didáctico de la Unidad 1.
 *
 * Existe para poder observar qué hace un `POST`: agrega un elemento a un arreglo
 * en memoria, y un `GET` posterior muestra que quedó adentro. Es el sustituto
 * más simple posible de una base de datos, sin ocultar nada.
 *
 * Estas funciones son puras y no saben de HTTP: no distinguen si el dato llegó
 * en el cuerpo de la solicitud o en la URL. Esa decisión es de la capa HTTP.
 */

/** Único mensaje de rechazo: el contrato de error también es parte del dominio. */
export const MENSAJE_ELEMENTO_INVALIDO = "El campo elemento debe ser un texto no vacío o un número";

/**
 * Un elemento es texto o número, y el tipo se conserva a propósito: es lo que
 * hace visible la diferencia entre mandar el dato por la URL —donde todo es
 * texto— y mandarlo en un cuerpo JSON, que sí distingue `42` de `"42"`.
 */
export type Elemento = string | number;

export type Validacion =
  | { valido: true; elemento: Elemento }
  | { valido: false; error: string };

export interface ElementoDescripto {
  indice: number;
  elemento: Elemento;
  tipo: "texto" | "numero";
}

export interface Descripcion {
  /** Cuántos elementos tiene el vector. */
  total: number;
  /** Cuántos se devuelven, que es distinto sólo cuando hay filtro. */
  cantidad: number;
  elementos: ElementoDescripto[];
}

export function validarElemento(valor: unknown): Validacion {
  if (typeof valor === "number" && !Number.isNaN(valor)) {
    return { valido: true, elemento: valor };
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    return { valido: true, elemento: valor.trim() };
  }

  return { valido: false, error: MENSAJE_ELEMENTO_INVALIDO };
}

/**
 * Enumera el vector. El índice que se devuelve es la posición real dentro del
 * vector, también cuando hay filtro: así el `GET /vector/:indice` de un elemento
 * filtrado sigue funcionando.
 */
export function describir(vector: readonly Elemento[], contiene?: string): Descripcion {
  const buscado = (contiene ?? "").trim().toLowerCase();

  const elementos = vector
    .map((elemento, indice) => ({
      indice,
      elemento,
      tipo: typeof elemento === "number" ? ("numero" as const) : ("texto" as const)
    }))
    .filter(({ elemento }) => String(elemento).toLowerCase().includes(buscado));

  return { total: vector.length, cantidad: elementos.length, elementos };
}

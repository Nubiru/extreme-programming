import { describe, expect, it } from "vitest";
import {
  MENSAJE_ELEMENTO_INVALIDO,
  describir,
  validarElemento,
  type Elemento
} from "./vector.ts";

/**
 * Reglas del vector didáctico: validar qué se puede guardar y describir lo
 * guardado. No hay HTTP acá: estas funciones no saben de dónde vino el dato,
 * si de un cuerpo JSON o de la URL.
 */
describe("validarElemento", () => {
  it("acepta un texto y le recorta los espacios de los bordes", () => {
    expect(validarElemento("  hola  ")).toEqual({ valido: true, elemento: "hola" });
  });

  it("acepta números, incluido el cero", () => {
    expect(validarElemento(42)).toEqual({ valido: true, elemento: 42 });
    expect(validarElemento(0)).toEqual({ valido: true, elemento: 0 });
    expect(validarElemento(-3.5)).toEqual({ valido: true, elemento: -3.5 });
  });

  // El tipo se conserva: es la diferencia observable entre mandar el dato por
  // la URL (siempre texto) y mandarlo en un cuerpo JSON (que tiene tipos).
  it("conserva la diferencia entre el número 42 y el texto \"42\"", () => {
    expect(validarElemento(42)).toEqual({ valido: true, elemento: 42 });
    expect(validarElemento("42")).toEqual({ valido: true, elemento: "42" });
  });

  it.each([
    ["texto vacío", ""],
    ["sólo espacios", "   "],
    ["ausente", undefined],
    ["nulo", null],
    ["booleano", true],
    ["objeto", { a: 1 }],
    ["arreglo", [1, 2]],
    ["NaN", Number.NaN]
  ])("rechaza %s", (_caso, valor) => {
    expect(validarElemento(valor)).toEqual({ valido: false, error: MENSAJE_ELEMENTO_INVALIDO });
  });
});

describe("describir", () => {
  const vector: Elemento[] = ["hola", 42, "Chau"];

  it("enumera los elementos con su índice y su tipo", () => {
    expect(describir(vector)).toEqual({
      total: 3,
      cantidad: 3,
      elementos: [
        { indice: 0, elemento: "hola", tipo: "texto" },
        { indice: 1, elemento: 42, tipo: "numero" },
        { indice: 2, elemento: "Chau", tipo: "texto" }
      ]
    });
  });

  it("describe un vector vacío sin inventar elementos", () => {
    expect(describir([])).toEqual({ total: 0, cantidad: 0, elementos: [] });
  });

  it("filtra por contenido sin distinguir mayúsculas y conserva el índice real", () => {
    expect(describir(vector, "cha")).toEqual({
      total: 3,
      cantidad: 1,
      elementos: [{ indice: 2, elemento: "Chau", tipo: "texto" }]
    });
  });

  it("compara los números como texto para poder filtrarlos", () => {
    expect(describir(vector, "4")).toMatchObject({ cantidad: 1 });
  });

  it("devuelve el vector completo cuando el filtro está vacío", () => {
    expect(describir(vector, "")).toMatchObject({ cantidad: 3 });
  });
});

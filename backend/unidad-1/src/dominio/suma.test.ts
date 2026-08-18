import { describe, expect, it } from "vitest";
import { suma } from "./suma.ts";
import {
  CASOS_INVALIDOS,
  CASOS_VALIDOS,
  MENSAJE_ARGUMENTOS_INVALIDOS
} from "../pruebas/suma.fixture.ts";

/**
 * Los mismos ejemplos que la característica `suma.feature`, un nivel más abajo.
 * El escenario Gherkin comunica el acuerdo con el cliente; estas pruebas dan el
 * feedback rápido durante el ciclo rojo-verde-refactor.
 */
describe("suma", () => {
  describe("casos que resuelve", () => {
    it.each(CASOS_VALIDOS)("suma $a y $b y da $esperado: $descripcion", ({ a, b, esperado }) => {
      expect(suma(a, b)).toBe(esperado);
    });

    it("acumula decimales con el error propio del punto flotante", () => {
      // 0.1 + 0.2 no es exactamente 0.3 en ningún lenguaje con IEEE 754.
      // Se afirma con tolerancia en lugar de esconder el detalle.
      expect(suma(0.1, 0.2)).toBeCloseTo(0.3);
      expect(suma(0.1, 0.2)).not.toBe(0.3);
    });

    it("es conmutativa", () => {
      expect(suma(7, 3)).toBe(suma(3, 7));
    });
  });

  describe("casos que rechaza", () => {
    it.each(CASOS_INVALIDOS)("falla con $descripcion", ({ a, b }) => {
      expect(() => suma(a, b)).toThrow(MENSAJE_ARGUMENTOS_INVALIDOS);
    });

    it("lanza un TypeError y no un Error genérico", () => {
      expect(() => suma("2", 3)).toThrow(TypeError);
    });

    it("no concatena cuando ambos argumentos son texto", () => {
      // Sin la validación, `"2" + "3"` daría "23": un resultado plausible y
      // equivocado. Este es el defecto que la función existe para evitar.
      expect(() => suma("2", "3")).toThrow(MENSAJE_ARGUMENTOS_INVALIDOS);
    });
  });

  describe("límites todavía sin acordar con el cliente", () => {
    it("hoy acepta Infinity porque el criterio sólo excluye NaN", () => {
      // Conducta actual, fijada a propósito para que un cambio de criterio se
      // note. Pendiente: preguntar si Infinity debe rechazarse como NaN.
      expect(suma(Infinity, 1)).toBe(Infinity);
    });
  });
});

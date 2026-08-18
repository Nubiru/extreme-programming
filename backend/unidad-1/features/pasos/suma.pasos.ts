import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { DataTable } from "@cucumber/cucumber";
import { suma } from "../../src/dominio/suma.ts";
import type { MundoDePruebas } from "../soporte/mundo.ts";

/**
 * Estos escenarios no pasan por HTTP: ejercitan la función del dominio.
 * Cucumber no es una herramienta de API; es una forma de que los criterios de
 * aceptación sean ejecutables, cualquiera sea el nivel que corresponda.
 */

/**
 * Traduce lo que se escribe en la tabla del escenario al valor de JavaScript.
 * La tabla debe seguir siendo legible para quien redactó los criterios: por eso
 * dice `nada` y no `undefined`.
 */
function interpretar(valor: string): unknown {
  const texto = valor.trim();

  if (texto === "nada") return undefined;
  if (texto === "nulo") return null;
  if (texto === "NaN") return Number.NaN;
  if (texto === "true") return true;
  if (texto === "false") return false;
  if (texto.startsWith('"') && texto.endsWith('"')) return texto.slice(1, -1);

  return Number(texto);
}

When("sumo {float} y {float}", function (this: MundoDePruebas, a: number, b: number) {
  this.intentar(() => suma(a, b));
});

Then("el resultado es {float}", function (this: MundoDePruebas, esperado: number) {
  assert.equal(this.error, undefined, `La suma falló con: ${String(this.error)}`);
  assert.equal(this.resultado, esperado);
});

Then("el resultado se aproxima a {float}", function (this: MundoDePruebas, esperado: number) {
  assert.equal(this.error, undefined, `La suma falló con: ${String(this.error)}`);
  assert.ok(
    Math.abs((this.resultado as number) - esperado) < 1e-9,
    `Se esperaba un valor cercano a ${esperado} y se obtuvo ${String(this.resultado)}`
  );
});

Then(
  "sumar estos pares da el resultado esperado:",
  function (this: MundoDePruebas, tabla: DataTable) {
    for (const fila of tabla.hashes()) {
      const a = interpretar(fila.a!);
      const b = interpretar(fila.b!);

      this.intentar(() => suma(a, b));

      assert.equal(this.error, undefined, `${fila.caso}: la suma falló inesperadamente`);
      assert.equal(this.resultado, Number(fila.resultado), `Falló el caso: ${fila.caso}`);
    }
  }
);

Then(
  "sumar estos pares falla con {string}:",
  function (this: MundoDePruebas, mensaje: string, tabla: DataTable) {
    for (const fila of tabla.hashes()) {
      const a = interpretar(fila.a!);
      const b = interpretar(fila.b!);

      this.intentar(() => suma(a, b));

      assert.ok(
        this.error instanceof TypeError,
        `${fila.caso}: se esperaba un TypeError y se obtuvo ${String(this.resultado)}`
      );
      assert.equal((this.error as TypeError).message, mensaje, `Falló el caso: ${fila.caso}`);
    }
  }
);

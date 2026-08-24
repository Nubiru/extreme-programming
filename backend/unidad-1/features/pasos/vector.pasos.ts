import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

/**
 * Pasos del vector didáctico. Los dos caminos por los que puede viajar el dato
 * —cuerpo JSON y parámetro de consulta— tienen un paso propio: la diferencia
 * entre ambos es justamente lo que estos escenarios muestran.
 */

interface ElementoDescripto {
  indice: number;
  elemento: string | number;
  tipo: string;
}

const agregarPorElCuerpo = function (this: MundoDePruebas, elemento: unknown): Promise<void> {
  return this.pedir("/vector", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elemento })
  });
};

When("agrego el elemento {string} al vector", async function (this: MundoDePruebas, elemento: string) {
  await agregarPorElCuerpo.call(this, elemento);
});

When("agrego el número {int} al vector", async function (this: MundoDePruebas, elemento: number) {
  await agregarPorElCuerpo.call(this, elemento);
});

When(
  "agrego el elemento {string} al vector por la URL",
  async function (this: MundoDePruebas, elemento: string) {
    await this.pedir(`/vector?elemento=${encodeURIComponent(elemento)}`, { method: "POST" });
  }
);

When("consulto el vector", async function (this: MundoDePruebas) {
  await this.pedir("/vector");
});

When("consulto el vector filtrando por {string}", async function (this: MundoDePruebas, filtro: string) {
  await this.pedir(`/vector?contiene=${encodeURIComponent(filtro)}`);
});

When("vacío el vector", async function (this: MundoDePruebas) {
  await this.pedirTexto("/vector", { method: "DELETE" });
});

Then("el vector tiene {int} elemento(s)", function (this: MundoDePruebas, cantidad: number) {
  const { cantidad: devueltos } = this.cuerpo as { cantidad: number };

  assert.equal(devueltos, cantidad, "el vector no tiene la cantidad de elementos esperada");
});

Then(
  "el elemento {int} del vector es {string}",
  function (this: MundoDePruebas, indice: number, esperado: string) {
    const { elementos } = this.cuerpo as { elementos: ElementoDescripto[] };
    const encontrado = elementos.find((elemento) => elemento.indice === indice);

    assert.ok(encontrado !== undefined, `no hay ningún elemento en la posición ${indice}`);
    assert.equal(encontrado.elemento, esperado);
  }
);

Then("el elemento guardado es del tipo {string}", function (this: MundoDePruebas, tipo: string) {
  const guardado = this.cuerpo as ElementoDescripto;

  assert.equal(guardado.tipo, tipo, `el elemento se guardó como ${guardado.tipo}`);
});

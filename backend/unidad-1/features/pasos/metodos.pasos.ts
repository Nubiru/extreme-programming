import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

/**
 * Pasos del contrato a nivel de método y encabezado. Son deliberadamente
 * genéricos —el método y la ruta llegan como parámetros— porque acá lo que se
 * verifica no es una regla académica sino el uso correcto de HTTP.
 */

When(
  "envío una solicitud {word} a {string}",
  async function (this: MundoDePruebas, metodo: string, ruta: string) {
    await this.pedirTexto(ruta, { method: metodo });
  }
);

When("comparo HEAD y GET sobre {string}", async function (this: MundoDePruebas, ruta: string) {
  await this.compararHeadYGet(ruta);
});

Then("la respuesta llega sin cuerpo", function (this: MundoDePruebas) {
  assert.equal(this.texto, "", "se esperaba una respuesta sin cuerpo");
});

Then(
  "el encabezado {string} vale {string}",
  function (this: MundoDePruebas, encabezado: string, esperado: string) {
    assert.equal(
      this.respuesta.headers.get(encabezado),
      esperado,
      `el encabezado ${encabezado} no vale lo acordado`
    );
  }
);

Then("ambas respuestas declaran el mismo Content-Length", function (this: MundoDePruebas) {
  const conCuerpo = this.respuesta.headers.get("content-length");
  const sinCuerpo = this.respuestaHead?.headers.get("content-length");
  const bytesReales = String(Buffer.byteLength(this.texto, "utf8"));

  assert.equal(conCuerpo, bytesReales, "GET no declara el tamaño real de su cuerpo");
  assert.equal(sinCuerpo, bytesReales, "HEAD no anuncia el tamaño que tendría el cuerpo");
});

Then("sólo la respuesta de GET trae cuerpo", function (this: MundoDePruebas) {
  assert.equal(this.textoHead, "", "HEAD no debe enviar cuerpo");
  assert.ok(this.texto.length > 0, "GET debe enviar cuerpo");
});

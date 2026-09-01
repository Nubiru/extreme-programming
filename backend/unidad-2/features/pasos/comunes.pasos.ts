import assert from "node:assert/strict";
import { Then } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

Then("la respuesta tiene código {int}", function (this: MundoDePruebas, codigo: number) {
  assert.equal(this.respuesta.status, codigo);
});

Then("el error tiene código {string}", function (this: MundoDePruebas, codigo: string) {
  assert.equal(this.cuerpo.error.code, codigo);
});

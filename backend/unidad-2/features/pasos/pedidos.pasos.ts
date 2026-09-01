import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

async function crearPedido(
  mundo: MundoDePruebas,
  cantidad: number,
  productoId: number
): Promise<void> {
  await mundo.pedirJson("POST", "/api/v1/pedidos", { productoId, cantidad });
}

When(
  "pido {int} unidades del producto {int}",
  async function (this: MundoDePruebas, cantidad: number, productoId: number) {
    await crearPedido(this, cantidad, productoId);
  }
);

Given(
  "que ya pedí {int} unidades del producto {int}",
  async function (this: MundoDePruebas, cantidad: number, productoId: number) {
    await crearPedido(this, cantidad, productoId);
    assert.equal(this.respuesta.status, 201);
  }
);

When("consulto el pedido {int}", async function (this: MundoDePruebas, id: number) {
  await this.pedir(`/api/v1/pedidos/${id}`);
});

When(
  "cambio el estado del pedido {int} a {string}",
  async function (this: MundoDePruebas, id: number, estado: string) {
    await this.pedirJson("PATCH", `/api/v1/pedidos/${id}`, { estado });
  }
);

Then(
  "el pedido devuelto está en estado {string}",
  function (this: MundoDePruebas, estado: string) {
    assert.equal(this.cuerpo.data.estado, estado);
  }
);

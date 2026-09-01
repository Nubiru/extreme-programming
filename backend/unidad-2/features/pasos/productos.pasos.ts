import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

async function crearProducto(
  mundo: MundoDePruebas,
  nombre: string,
  precio: number,
  stock: number
): Promise<void> {
  await mundo.pedirJson("POST", "/api/v1/productos", { nombre, precio, stock });
}

When(
  "creo el producto {string} con precio {int} y stock {int}",
  async function (this: MundoDePruebas, nombre: string, precio: number, stock: number) {
    await crearProducto(this, nombre, precio, stock);
  }
);

Given(
  "que existe el producto {string} con precio {int} y stock {int}",
  async function (this: MundoDePruebas, nombre: string, precio: number, stock: number) {
    await crearProducto(this, nombre, precio, stock);
    assert.equal(this.respuesta.status, 201);
  }
);

When("consulto el producto {int}", async function (this: MundoDePruebas, id: number) {
  await this.pedir(`/api/v1/productos/${id}`);
});

When("consulto el producto {string}", async function (this: MundoDePruebas, id: string) {
  await this.pedir(`/api/v1/productos/${id}`);
});

When(
  "cambio el stock del producto {int} a {int}",
  async function (this: MundoDePruebas, id: number, stock: number) {
    await this.pedirJson("PATCH", `/api/v1/productos/${id}`, { stock });
  }
);

When("elimino el producto {int}", async function (this: MundoDePruebas, id: number) {
  await this.pedir(`/api/v1/productos/${id}`, { method: "DELETE" });
});

When("busco productos con el texto {string}", async function (this: MundoDePruebas, texto: string) {
  await this.pedir(`/api/v1/productos?q=${encodeURIComponent(texto)}`);
});

Then(
  "la lista devuelta contiene únicamente {string}",
  function (this: MundoDePruebas, nombre: string) {
    assert.equal(this.cuerpo.data.length, 1);
    assert.equal(this.cuerpo.data[0].nombre, nombre);
  }
);

Then(
  "el producto devuelto tiene nombre {string}",
  function (this: MundoDePruebas, nombre: string) {
    assert.equal(this.cuerpo.data.nombre, nombre);
  }
);

Then("el producto devuelto tiene stock {int}", function (this: MundoDePruebas, stock: number) {
  assert.equal(this.cuerpo.data.stock, stock);
});

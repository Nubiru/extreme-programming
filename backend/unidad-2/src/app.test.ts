import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { crearApp } from "./app.ts";
import { crearBaseDeDatos } from "./db/database.ts";
import { ProductosRepositorySqlite } from "./productos/productos.repository.ts";
import { ProductosService } from "./productos/productos.service.ts";
import { PedidosRepositorySqlite } from "./pedidos/pedidos.repository.ts";
import { PedidosService } from "./pedidos/pedidos.service.ts";

/**
 * Pruebas de contrato HTTP: la aplicación completa sobre SQLite en memoria
 * (":memory:"), una base nueva y vacía por cada prueba.
 */
function crearAppDePrueba(): Express {
  const db = crearBaseDeDatos(":memory:");
  const productosRepository = new ProductosRepositorySqlite(db);
  const pedidosRepository = new PedidosRepositorySqlite(db);
  return crearApp({
    productosService: new ProductosService(productosRepository),
    pedidosService: new PedidosService(pedidosRepository, productosRepository)
  });
}

const productoValido = { nombre: "Notebook", precio: 950000, stock: 5 };

describe("API /api/v1/productos", () => {
  let app: Express;

  beforeEach(() => {
    app = crearAppDePrueba();
  });

  it("POST crea con datos válidos → 201, Location y recurso creado", async () => {
    const respuesta = await request(app).post("/api/v1/productos").send(productoValido);
    expect(respuesta.status).toBe(201);
    expect(respuesta.headers.location).toBe("/api/v1/productos/1");
    expect(respuesta.body.data).toMatchObject({ id: 1, ...productoValido });
  });

  it("POST sin nombre → 422 con error uniforme", async () => {
    const respuesta = await request(app).post("/api/v1/productos").send({ precio: 10, stock: 1 });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.code).toBe("NOMBRE_INVALIDO");
  });

  it("POST con JSON mal formado → 400", async () => {
    const respuesta = await request(app)
      .post("/api/v1/productos")
      .set("Content-Type", "application/json")
      .send("{no es json");
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.code).toBe("JSON_INVALIDO");
  });

  it("GET lista la colección → 200", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const respuesta = await request(app).get("/api/v1/productos");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data).toHaveLength(1);
  });

  it("GET por id existente → 200 (búsqueda por id)", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const respuesta = await request(app).get("/api/v1/productos/1");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data.nombre).toBe("Notebook");
  });

  it("GET con ?q= filtra por nombre → 200 solo con coincidencias", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    await request(app)
      .post("/api/v1/productos")
      .send({ nombre: "Mouse inalámbrico", precio: 25000, stock: 3 });
    const respuesta = await request(app).get("/api/v1/productos?q=mou");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data).toHaveLength(1);
    expect(respuesta.body.data[0].nombre).toBe("Mouse inalámbrico");
  });

  it("GET por id inexistente → 404", async () => {
    const respuesta = await request(app).get("/api/v1/productos/99");
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.code).toBe("PRODUCTO_INEXISTENTE");
  });

  it("GET por id inválido → 400", async () => {
    const respuesta = await request(app).get("/api/v1/productos/abc");
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.code).toBe("ID_INVALIDO");
  });

  it("PUT reemplaza el recurso completo → 200", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const respuesta = await request(app)
      .put("/api/v1/productos/1")
      .send({ nombre: "Notebook gamer", precio: 1200000, stock: 2 });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data).toMatchObject({ id: 1, nombre: "Notebook gamer", stock: 2 });
  });

  it("PATCH modifica un campo válido → 200", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const respuesta = await request(app).patch("/api/v1/productos/1").send({ stock: 99 });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data).toMatchObject({ id: 1, nombre: "Notebook", stock: 99 });
  });

  it("PATCH con precio inválido → 422", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const respuesta = await request(app).patch("/api/v1/productos/1").send({ precio: -1 });
    expect(respuesta.status).toBe(422);
  });

  it("DELETE de recurso existente → 204 y ya no aparece", async () => {
    await request(app).post("/api/v1/productos").send(productoValido);
    const eliminacion = await request(app).delete("/api/v1/productos/1");
    expect(eliminacion.status).toBe(204);
    const consulta = await request(app).get("/api/v1/productos/1");
    expect(consulta.status).toBe(404);
  });

  it("ruta desconocida → 404 uniforme", async () => {
    const respuesta = await request(app).get("/api/v1/clientes");
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.code).toBe("RUTA_DESCONOCIDA");
  });
});

describe("API /api/v1/pedidos", () => {
  let app: Express;

  beforeEach(async () => {
    app = crearAppDePrueba();
    await request(app).post("/api/v1/productos").send(productoValido);
  });

  it("POST crea un pedido válido → 201 en estado pendiente", async () => {
    const respuesta = await request(app)
      .post("/api/v1/pedidos")
      .send({ productoId: 1, cantidad: 2 });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.data).toMatchObject({ id: 1, productoId: 1, estado: "pendiente" });
  });

  it("POST con producto inexistente → 422", async () => {
    const respuesta = await request(app)
      .post("/api/v1/pedidos")
      .send({ productoId: 99, cantidad: 1 });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.code).toBe("PRODUCTO_INEXISTENTE");
  });

  it("POST con más cantidad que stock → 422", async () => {
    const respuesta = await request(app)
      .post("/api/v1/pedidos")
      .send({ productoId: 1, cantidad: 50 });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.code).toBe("STOCK_INSUFICIENTE");
  });

  it("GET por id existente → 200 (búsqueda por id)", async () => {
    await request(app).post("/api/v1/pedidos").send({ productoId: 1, cantidad: 2 });
    const respuesta = await request(app).get("/api/v1/pedidos/1");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data.cantidad).toBe(2);
  });

  it("GET por id inexistente → 404", async () => {
    const respuesta = await request(app).get("/api/v1/pedidos/7");
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error.code).toBe("PEDIDO_INEXISTENTE");
  });

  it("PATCH cambia el estado → 200", async () => {
    await request(app).post("/api/v1/pedidos").send({ productoId: 1, cantidad: 2 });
    const respuesta = await request(app).patch("/api/v1/pedidos/1").send({ estado: "enviado" });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data.estado).toBe("enviado");
  });

  it("PATCH con estado inválido → 422", async () => {
    await request(app).post("/api/v1/pedidos").send({ productoId: 1, cantidad: 2 });
    const respuesta = await request(app).patch("/api/v1/pedidos/1").send({ estado: "perdido" });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body.error.code).toBe("ESTADO_INVALIDO");
  });

  it("DELETE de pedido existente → 204", async () => {
    await request(app).post("/api/v1/pedidos").send({ productoId: 1, cantidad: 2 });
    const respuesta = await request(app).delete("/api/v1/pedidos/1");
    expect(respuesta.status).toBe(204);
  });
});

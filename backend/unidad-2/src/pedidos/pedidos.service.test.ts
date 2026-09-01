import { describe, expect, it, beforeEach } from "vitest";
import {
  PedidosRepositorySimulado,
  ProductosRepositorySimulado,
  pedidosMock,
  productosMock
} from "../pruebas/repositorios-simulados.ts";
import { PedidosService } from "./pedidos.service.ts";

describe("PedidosService (repositorios simulados con datos mock)", () => {
  let service: PedidosService;

  beforeEach(() => {
    service = new PedidosService(
      new PedidosRepositorySimulado(structuredClone(pedidosMock)),
      new ProductosRepositorySimulado(structuredClone(productosMock))
    );
  });

  it("obtiene todos los pedidos mock", () => {
    expect(service.obtenerTodos()).toHaveLength(2);
  });

  it("busca un pedido por id", () => {
    expect(service.obtenerPorId(2).estado).toBe("entregado");
  });

  it("lanza 404 al buscar un id inexistente", () => {
    expect(() => service.obtenerPorId(99)).toThrowError(
      expect.objectContaining({ status: 404, code: "PEDIDO_INEXISTENTE" })
    );
  });

  it("crea un pedido en estado pendiente", () => {
    const pedido = service.crear({ productoId: 1, cantidad: 3 });
    expect(pedido).toMatchObject({ id: 3, productoId: 1, cantidad: 3, estado: "pendiente" });
  });

  it("rechaza un pedido de un producto inexistente", () => {
    expect(() => service.crear({ productoId: 99, cantidad: 1 })).toThrowError(
      expect.objectContaining({ status: 422, code: "PRODUCTO_INEXISTENTE" })
    );
  });

  it("rechaza un pedido sin stock suficiente", () => {
    // El producto 2 del mock tiene stock 0.
    expect(() => service.crear({ productoId: 2, cantidad: 1 })).toThrowError(
      expect.objectContaining({ status: 422, code: "STOCK_INSUFICIENTE" })
    );
  });

  it("modifica parcialmente el estado", () => {
    const pedido = service.actualizar(1, { estado: "enviado" });
    expect(pedido.estado).toBe("enviado");
    expect(pedido.cantidad).toBe(2);
  });

  it("elimina un pedido existente", () => {
    service.eliminar(2);
    expect(service.obtenerTodos()).toHaveLength(1);
  });
});

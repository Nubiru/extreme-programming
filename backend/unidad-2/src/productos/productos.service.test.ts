import { describe, expect, it, beforeEach } from "vitest";
import { AppError } from "../errors/app-error.ts";
import {
  ProductosRepositorySimulado,
  productosMock
} from "../pruebas/repositorios-simulados.ts";
import { ProductosService } from "./productos.service.ts";

describe("ProductosService (repositorio simulado con datos mock)", () => {
  let service: ProductosService;

  beforeEach(() => {
    service = new ProductosService(
      new ProductosRepositorySimulado(structuredClone(productosMock))
    );
  });

  it("obtiene todos los productos mock", () => {
    expect(service.obtenerTodos()).toHaveLength(3);
  });

  it("busca un producto por id", () => {
    const producto = service.obtenerPorId(2);
    expect(producto.nombre).toBe("Mouse inalámbrico");
  });

  it("lanza 404 al buscar un id inexistente", () => {
    expect(() => service.obtenerPorId(99)).toThrowError(
      expect.objectContaining({ status: 404, code: "PRODUCTO_INEXISTENTE" })
    );
  });

  it("crea un producto con id y fecha generados por el servidor", () => {
    const producto = service.crear({ nombre: "Monitor", precio: 300000, stock: 4 });
    expect(producto.id).toBe(4);
    expect(producto.fechaCreacion).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(service.obtenerTodos()).toHaveLength(4);
  });

  it("reemplaza (PUT) conservando id y fecha de creación", () => {
    const producto = service.reemplazar(1, { nombre: "Notebook gamer", precio: 1200000, stock: 2 });
    expect(producto).toMatchObject({
      id: 1,
      nombre: "Notebook gamer",
      precio: 1200000,
      stock: 2,
      fechaCreacion: productosMock[0].fechaCreacion
    });
  });

  it("modifica parcialmente (PATCH) solo los campos enviados", () => {
    const producto = service.actualizar(3, { stock: 20 });
    expect(producto.stock).toBe(20);
    expect(producto.nombre).toBe("Teclado mecánico");
  });

  it("elimina un producto existente", () => {
    service.eliminar(1);
    expect(service.obtenerTodos()).toHaveLength(2);
    expect(() => service.obtenerPorId(1)).toThrowError(AppError);
  });

  it("lanza 404 al eliminar un id inexistente", () => {
    expect(() => service.eliminar(99)).toThrowError(
      expect.objectContaining({ status: 404 })
    );
  });

  // Búsqueda por nombre, desarrollada con TDD (ver BITACORA-TDD.md).
  it("filtra por texto en el nombre, sin distinguir mayúsculas", () => {
    const resultado = service.obtenerTodos("MOUSE");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe("Mouse inalámbrico");
  });

  it("con un texto que no coincide devuelve una lista vacía", () => {
    expect(service.obtenerTodos("impresora")).toHaveLength(0);
  });
});

import type { Producto } from "../productos/producto.ts";
import type { ProductosRepository } from "../productos/productos.repository.ts";
import type { Pedido } from "../pedidos/pedido.ts";
import type { PedidosRepository } from "../pedidos/pedidos.repository.ts";

/**
 * Repositorios simulados (mocks) para las pruebas unitarias de los servicios:
 * cumplen el mismo contrato que los repositorios SQLite, pero guardan los
 * datos mock en un arreglo. Gracias a la inyección de dependencias, los
 * servicios no notan la diferencia.
 */

export const productosMock: Producto[] = [
  { id: 1, nombre: "Notebook", precio: 950000, stock: 5, fechaCreacion: "2026-08-01T10:00:00.000Z" },
  { id: 2, nombre: "Mouse inalámbrico", precio: 25000, stock: 0, fechaCreacion: "2026-08-02T11:30:00.000Z" },
  { id: 3, nombre: "Teclado mecánico", precio: 80000, stock: 12, fechaCreacion: "2026-08-03T09:15:00.000Z" }
];

export const pedidosMock: Pedido[] = [
  { id: 1, productoId: 1, cantidad: 2, estado: "pendiente", fechaCreacion: "2026-08-10T14:00:00.000Z" },
  { id: 2, productoId: 3, cantidad: 1, estado: "entregado", fechaCreacion: "2026-08-11T16:45:00.000Z" }
];

export class ProductosRepositorySimulado implements ProductosRepository {
  constructor(private readonly productos: Producto[] = []) {}

  obtenerTodos(): Producto[] {
    return [...this.productos];
  }

  buscarPorId(id: number): Producto | undefined {
    return this.productos.find((producto) => producto.id === id);
  }

  guardar(datos: Omit<Producto, "id">): Producto {
    const id = Math.max(0, ...this.productos.map((producto) => producto.id)) + 1;
    const producto: Producto = { id, ...datos };
    this.productos.push(producto);
    return producto;
  }

  actualizar(producto: Producto): void {
    const indice = this.productos.findIndex((existente) => existente.id === producto.id);
    if (indice >= 0) this.productos[indice] = producto;
  }

  eliminar(id: number): void {
    const indice = this.productos.findIndex((producto) => producto.id === id);
    if (indice >= 0) this.productos.splice(indice, 1);
  }
}

export class PedidosRepositorySimulado implements PedidosRepository {
  constructor(private readonly pedidos: Pedido[] = []) {}

  obtenerTodos(): Pedido[] {
    return [...this.pedidos];
  }

  buscarPorId(id: number): Pedido | undefined {
    return this.pedidos.find((pedido) => pedido.id === id);
  }

  guardar(datos: Omit<Pedido, "id">): Pedido {
    const id = Math.max(0, ...this.pedidos.map((pedido) => pedido.id)) + 1;
    const pedido: Pedido = { id, ...datos };
    this.pedidos.push(pedido);
    return pedido;
  }

  actualizar(pedido: Pedido): void {
    const indice = this.pedidos.findIndex((existente) => existente.id === pedido.id);
    if (indice >= 0) this.pedidos[indice] = pedido;
  }

  eliminar(id: number): void {
    const indice = this.pedidos.findIndex((pedido) => pedido.id === id);
    if (indice >= 0) this.pedidos.splice(indice, 1);
  }
}

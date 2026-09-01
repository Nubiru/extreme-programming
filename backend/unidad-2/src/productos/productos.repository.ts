import type { DatabaseSync } from "node:sqlite";
import type { Producto } from "./producto.ts";

/**
 * Contrato del repositorio. El servicio depende de esta interfaz, no de SQLite:
 * en las pruebas se inyecta un repositorio simulado con datos mock.
 */
export interface ProductosRepository {
  obtenerTodos(): Producto[];
  buscarPorId(id: number): Producto | undefined;
  guardar(datos: Omit<Producto, "id">): Producto;
  actualizar(producto: Producto): void;
  eliminar(id: number): void;
}

interface FilaProducto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fecha_creacion: string;
}

function aEntidad(fila: FilaProducto): Producto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    precio: fila.precio,
    stock: fila.stock,
    fechaCreacion: fila.fecha_creacion
  };
}

export class ProductosRepositorySqlite implements ProductosRepository {
  constructor(private readonly db: DatabaseSync) {}

  obtenerTodos(): Producto[] {
    const filas = this.db
      .prepare("SELECT * FROM productos ORDER BY id")
      .all() as unknown as FilaProducto[];
    return filas.map(aEntidad);
  }

  buscarPorId(id: number): Producto | undefined {
    const fila = this.db.prepare("SELECT * FROM productos WHERE id = ?").get(id) as
      | FilaProducto
      | undefined;
    return fila ? aEntidad(fila) : undefined;
  }

  guardar(datos: Omit<Producto, "id">): Producto {
    const resultado = this.db
      .prepare("INSERT INTO productos (nombre, precio, stock, fecha_creacion) VALUES (?, ?, ?, ?)")
      .run(datos.nombre, datos.precio, datos.stock, datos.fechaCreacion);
    console.log("repo");
    return { id: Number(resultado.lastInsertRowid), ...datos };
  }

  actualizar(producto: Producto): void {
    this.db
      .prepare("UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?")
      .run(producto.nombre, producto.precio, producto.stock, producto.id);
  }

  eliminar(id: number): void {
    this.db.prepare("DELETE FROM productos WHERE id = ?").run(id);
  }
}

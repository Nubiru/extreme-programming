import type { DatabaseSync } from "node:sqlite";
import type { Pedido, EstadoPedido } from "./pedido.ts";

/** Contrato del repositorio de pedidos; las pruebas inyectan uno simulado. */
export interface PedidosRepository {
  obtenerTodos(): Pedido[];
  buscarPorId(id: number): Pedido | undefined;
  guardar(datos: Omit<Pedido, "id">): Pedido;
  actualizar(pedido: Pedido): void;
  eliminar(id: number): void;
}

interface FilaPedido {
  id: number;
  producto_id: number;
  cantidad: number;
  estado: EstadoPedido;
  fecha_creacion: string;
}

function aEntidad(fila: FilaPedido): Pedido {
  return {
    id: fila.id,
    productoId: fila.producto_id,
    cantidad: fila.cantidad,
    estado: fila.estado,
    fechaCreacion: fila.fecha_creacion
  };
}

export class PedidosRepositorySqlite implements PedidosRepository {
  constructor(private readonly db: DatabaseSync) {}

  obtenerTodos(): Pedido[] {
    const filas = this.db
      .prepare("SELECT * FROM pedidos ORDER BY id")
      .all() as unknown as FilaPedido[];
    return filas.map(aEntidad);
  }

  buscarPorId(id: number): Pedido | undefined {
    const fila = this.db.prepare("SELECT * FROM pedidos WHERE id = ?").get(id) as
      | FilaPedido
      | undefined;
    return fila ? aEntidad(fila) : undefined;
  }

  guardar(datos: Omit<Pedido, "id">): Pedido {
    const resultado = this.db
      .prepare(
        "INSERT INTO pedidos (producto_id, cantidad, estado, fecha_creacion) VALUES (?, ?, ?, ?)"
      )
      .run(datos.productoId, datos.cantidad, datos.estado, datos.fechaCreacion);
    return { id: Number(resultado.lastInsertRowid), ...datos };
  }

  actualizar(pedido: Pedido): void {
    this.db
      .prepare("UPDATE pedidos SET producto_id = ?, cantidad = ?, estado = ? WHERE id = ?")
      .run(pedido.productoId, pedido.cantidad, pedido.estado, pedido.id);
  }

  eliminar(id: number): void {
    this.db.prepare("DELETE FROM pedidos WHERE id = ?").run(id);
  }
}

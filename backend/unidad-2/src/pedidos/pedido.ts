export type EstadoPedido = "pendiente" | "enviado" | "entregado";

/** Entidad del dominio: un pedido de una cantidad de un producto. */
export interface Pedido {
  id: number;
  productoId: number;
  cantidad: number;
  estado: EstadoPedido;
  fechaCreacion: string;
}

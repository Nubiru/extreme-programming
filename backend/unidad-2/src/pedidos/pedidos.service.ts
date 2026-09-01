import { AppError } from "../errors/app-error.ts";
import type { ProductosRepository } from "../productos/productos.repository.ts";
import type { Pedido } from "./pedido.ts";
import type { CrearPedidoDto, ActualizarPedidoDto } from "./pedidos.dto.ts";
import type { PedidosRepository } from "./pedidos.repository.ts";

/**
 * Reglas de negocio: un pedido solo puede crearse sobre un producto existente
 * y con stock suficiente. Recibe ambos repositorios por inyección de dependencias.
 */
export class PedidosService {
  constructor(
    private readonly repository: PedidosRepository,
    private readonly productosRepository: ProductosRepository
  ) {}

  obtenerTodos(): Pedido[] {
    return this.repository.obtenerTodos();
  }

  obtenerPorId(id: number): Pedido {
    const pedido = this.repository.buscarPorId(id);
    if (!pedido) {
      throw new AppError(404, "PEDIDO_INEXISTENTE", "El pedido solicitado no existe");
    }
    return pedido;
  }

  crear(dto: CrearPedidoDto): Pedido {
    const producto = this.productosRepository.buscarPorId(dto.productoId);
    if (!producto) {
      throw new AppError(422, "PRODUCTO_INEXISTENTE", "El producto del pedido no existe");
    }
    if (producto.stock < dto.cantidad) {
      throw new AppError(422, "STOCK_INSUFICIENTE", "No hay stock suficiente para el pedido");
    }
    return this.repository.guardar({
      productoId: dto.productoId,
      cantidad: dto.cantidad,
      estado: "pendiente",
      fechaCreacion: new Date().toISOString()
    });
  }

  actualizar(id: number, dto: ActualizarPedidoDto): Pedido {
    const existente = this.obtenerPorId(id);
    const pedido: Pedido = { ...existente, ...dto };
    this.repository.actualizar(pedido);
    return pedido;
  }

  eliminar(id: number): void {
    this.obtenerPorId(id);
    this.repository.eliminar(id);
  }
}
